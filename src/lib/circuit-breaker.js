// Circuit Breaker Pattern para Protección contra Cascadas de Fallos
import { redis } from './redis';

export class CircuitBreaker {
  constructor(name, options = {}) {
    this.name = name;
    this.failureThreshold = options.failureThreshold || 5;
    this.timeout = options.timeout || 60000; // 1 minuto
    this.monitoringPeriod = options.monitoringPeriod || 60000; // 1 minuto
    this.minimumRequestCount = options.minimumRequestCount || 3;
    
    // Estados del circuit breaker
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failures = 0;
    this.successes = 0;
    this.lastFailureTime = null;
    this.lastSuccessTime = null;
    this.totalRequests = 0;
    
    // Métricas
    this.metrics = {
      totalRequests: 0,
      totalFailures: 0,
      totalSuccesses: 0,
      lastStateChange: Date.now(),
      averageResponseTime: 0
    };
    
    // Configurar limpieza automática
    this.setupCleanup();
  }

  // Ejecutar operación con protección del circuit breaker
  async execute(operation, context = '') {
    const startTime = Date.now();
    this.totalRequests++;
    this.metrics.totalRequests++;

    // Verificar estado del circuit breaker
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
        console.log(`🔄 Circuit breaker ${this.name} changed to HALF_OPEN`);
      } else {
        throw new CircuitBreakerError(
          `Circuit breaker ${this.name} is OPEN. Service temporarily unavailable.`,
          this.getTimeUntilReset()
        );
      }
    }

    try {
      // Ejecutar la operación
      const result = await operation();
      const responseTime = Date.now() - startTime;
      
      this.onSuccess(responseTime);
      return result;
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.onFailure(error, responseTime);
      throw error;
    }
  }

  // Manejar éxito
  onSuccess(responseTime) {
    this.successes++;
    this.metrics.totalSuccesses++;
    this.lastSuccessTime = Date.now();
    
    // Actualizar tiempo promedio de respuesta
    this.updateAverageResponseTime(responseTime);
    
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      this.failures = 0;
      this.metrics.lastStateChange = Date.now();
      console.log(`✅ Circuit breaker ${this.name} changed to CLOSED`);
    }
  }

  // Manejar fallo
  onFailure(error, responseTime) {
    this.failures++;
    this.metrics.totalFailures++;
    this.lastFailureTime = Date.now();
    
    // Actualizar tiempo promedio de respuesta
    this.updateAverageResponseTime(responseTime);
    
    // Verificar si debe abrirse el circuit breaker
    if (this.shouldOpen()) {
      this.state = 'OPEN';
      this.metrics.lastStateChange = Date.now();
      console.log(`🚨 Circuit breaker ${this.name} changed to OPEN`);
      
      // Guardar estado en Redis para persistencia
      this.saveState();
    }
  }

  // Verificar si debe abrirse el circuit breaker
  shouldOpen() {
    // Solo abrir si hay suficientes requests y fallos
    if (this.totalRequests < this.minimumRequestCount) {
      return false;
    }
    
    // Calcular tasa de fallos
    const failureRate = this.failures / this.totalRequests;
    const failureThreshold = this.failureThreshold / 100; // Convertir a decimal
    
    return failureRate >= failureThreshold;
  }

  // Actualizar tiempo promedio de respuesta
  updateAverageResponseTime(responseTime) {
    const totalResponses = this.metrics.totalSuccesses + this.metrics.totalFailures;
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime * (totalResponses - 1) + responseTime) / totalResponses;
  }

  // Obtener tiempo hasta el próximo reset
  getTimeUntilReset() {
    if (this.state !== 'OPEN' || !this.lastFailureTime) {
      return 0;
    }
    
    const timeSinceFailure = Date.now() - this.lastFailureTime;
    return Math.max(0, this.timeout - timeSinceFailure);
  }

  // Obtener estado actual
  getState() {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      totalRequests: this.totalRequests,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      timeUntilReset: this.getTimeUntilReset(),
      metrics: { ...this.metrics }
    };
  }

  // Forzar cambio de estado (útil para testing)
  forceState(newState) {
    const previousState = this.state;
    this.state = newState;
    this.metrics.lastStateChange = Date.now();
    
    if (newState === 'CLOSED') {
      this.failures = 0;
      this.successes = 0;
    }
    
    console.log(`🔧 Circuit breaker ${this.name} forced to ${newState} from ${previousState}`);
    this.saveState();
  }

  // Guardar estado en Redis
  async saveState() {
    try {
      const stateData = {
        state: this.state,
        failures: this.failures,
        successes: this.successes,
        totalRequests: this.totalRequests,
        lastFailureTime: this.lastFailureTime,
        lastSuccessTime: this.lastSuccessTime,
        metrics: this.metrics,
        timestamp: Date.now()
      };
      
      await redis.setex(
        `circuit_breaker:${this.name}`,
        3600, // 1 hora TTL
        JSON.stringify(stateData)
      );
    } catch (error) {
      console.error(`❌ Error saving circuit breaker state for ${this.name}:`, error);
    }
  }

  // Cargar estado desde Redis
  async loadState() {
    try {
      const stateData = await redis.get(`circuit_breaker:${this.name}`);
      if (stateData) {
        // Asegurar que stateData sea un string antes de parsearlo
        const stateString = typeof stateData === 'string' ? stateData : JSON.stringify(stateData);
        const parsed = JSON.parse(stateString);
        this.state = parsed.state;
        this.failures = parsed.failures || 0;
        this.successes = parsed.successes || 0;
        this.totalRequests = parsed.totalRequests || 0;
        this.lastFailureTime = parsed.lastFailureTime;
        this.lastSuccessTime = parsed.lastSuccessTime;
        this.metrics = parsed.metrics || this.metrics;
        
        console.log(`📥 Loaded circuit breaker state for ${this.name}: ${this.state}`);
      }
    } catch (error) {
      console.error(`❌ Error loading circuit breaker state for ${this.name}:`, error);
    }
  }

  // Configurar limpieza automática
  setupCleanup() {
    // Limpiar métricas cada hora
    setInterval(() => {
      this.cleanup();
    }, this.monitoringPeriod);
  }

  // Limpiar métricas antiguas
  cleanup() {
    const now = Date.now();
    const cutoff = now - this.monitoringPeriod;
    
    // Resetear contadores si han pasado mucho tiempo
    if (this.lastFailureTime && this.lastFailureTime < cutoff) {
      this.failures = 0;
      this.successes = 0;
      this.totalRequests = 0;
    }
    
    // Guardar estado limpio
    this.saveState();
  }

  // Obtener estadísticas
  getStats() {
    const failureRate = this.totalRequests > 0 ? (this.failures / this.totalRequests) * 100 : 0;
    const successRate = this.totalRequests > 0 ? (this.successes / this.totalRequests) * 100 : 0;
    
    return {
      name: this.name,
      state: this.state,
      failureRate: failureRate.toFixed(2) + '%',
      successRate: successRate.toFixed(2) + '%',
      totalRequests: this.totalRequests,
      failures: this.failures,
      successes: this.successes,
      averageResponseTime: this.metrics.averageResponseTime.toFixed(2) + 'ms',
      timeUntilReset: this.getTimeUntilReset(),
      lastStateChange: new Date(this.metrics.lastStateChange).toISOString()
    };
  }
}

// Clase para error del circuit breaker
export class CircuitBreakerError extends Error {
  constructor(message, timeUntilReset) {
    super(message);
    this.name = 'CircuitBreakerError';
    this.timeUntilReset = timeUntilReset;
    this.status = 503; // Service Unavailable
  }
}

// Gestor global de circuit breakers
export class CircuitBreakerManager {
  static breakers = new Map();
  static defaultOptions = {
    failureThreshold: 5,
    timeout: 60000,
    monitoringPeriod: 60000,
    minimumRequestCount: 3
  };

  // Crear o obtener un circuit breaker
  static getBreaker(name, options = {}) {
    if (!this.breakers.has(name)) {
      const config = { ...this.defaultOptions, ...options };
      const breaker = new CircuitBreaker(name, config);
      
      // Cargar estado guardado
      breaker.loadState();
      
      this.breakers.set(name, breaker);
    }
    
    return this.breakers.get(name);
  }

  // Ejecutar operación con circuit breaker
  static async execute(name, operation, options = {}) {
    const breaker = this.getBreaker(name, options);
    return await breaker.execute(operation);
  }

  // Obtener estadísticas de todos los circuit breakers
  static getStats() {
    const stats = {};
    for (const [name, breaker] of this.breakers.entries()) {
      stats[name] = breaker.getStats();
    }
    return stats;
  }

  // Forzar estado de un circuit breaker
  static forceState(name, state) {
    const breaker = this.breakers.get(name);
    if (breaker) {
      breaker.forceState(state);
    }
  }

  // Limpiar circuit breakers inactivos
  static cleanup() {
    const now = Date.now();
    const cutoff = now - 3600000; // 1 hora
    
    for (const [name, breaker] of this.breakers.entries()) {
      if (breaker.metrics.lastStateChange < cutoff) {
        this.breakers.delete(name);
      }
    }
  }

  // Obtener estado de salud general
  static getHealthStatus() {
    const stats = this.getStats();
    const totalBreakers = Object.keys(stats).length;
    const openBreakers = Object.values(stats).filter(s => s.state === 'OPEN').length;
    const halfOpenBreakers = Object.values(stats).filter(s => s.state === 'HALF_OPEN').length;
    
    return {
      totalBreakers,
      openBreakers,
      halfOpenBreakers,
      closedBreakers: totalBreakers - openBreakers - halfOpenBreakers,
      health: openBreakers === 0 ? 'healthy' : openBreakers < totalBreakers / 2 ? 'degraded' : 'unhealthy'
    };
  }
}

// Funciones helper para uso común
export const createCircuitBreaker = (name, options) => {
  return CircuitBreakerManager.getBreaker(name, options);
};

export const executeWithCircuitBreaker = (name, operation, options) => {
  return CircuitBreakerManager.execute(name, operation, options);
};

// Limpiar circuit breakers cada hora
setInterval(() => {
  CircuitBreakerManager.cleanup();
}, 3600000);
