// Rate Limiter para prevenir spam de pedidos
class RateLimiter {
  constructor() {
    this.requests = new Map();
    this.maxRequests = 5; // Máximo 5 pedidos por minuto por IP
    this.windowMs = 60000; // Ventana de 1 minuto
  }

  // Verificar si una IP puede hacer una petición
  canMakeRequest(ip) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.requests.has(ip)) {
      this.requests.set(ip, []);
    }
    
    const userRequests = this.requests.get(ip);
    
    // Limpiar requests antiguos fuera de la ventana
    const validRequests = userRequests.filter(timestamp => timestamp > windowStart);
    this.requests.set(ip, validRequests);
    
    // Verificar si puede hacer más requests
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    // Agregar el nuevo request
    validRequests.push(now);
    this.requests.set(ip, validRequests);
    
    return true;
  }

  // Obtener tiempo restante para el siguiente request
  getTimeUntilReset(ip) {
    const userRequests = this.requests.get(ip) || [];
    if (userRequests.length === 0) return 0;
    
    const oldestRequest = Math.min(...userRequests);
    const windowStart = Date.now() - this.windowMs;
    
    return Math.max(0, oldestRequest - windowStart);
  }

  // Limpiar requests antiguos (ejecutar periódicamente)
  cleanup() {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    for (const [ip, requests] of this.requests.entries()) {
      const validRequests = requests.filter(timestamp => timestamp > windowStart);
      if (validRequests.length === 0) {
        this.requests.delete(ip);
      } else {
        this.requests.set(ip, validRequests);
      }
    }
  }
}

// Instancia global del rate limiter
export const rateLimiter = new RateLimiter();

// Limpiar requests antiguos cada 5 minutos
setInterval(() => {
  rateLimiter.cleanup();
}, 5 * 60 * 1000);

// Middleware para aplicar rate limiting
export function applyRateLimit(ip) {
  if (!rateLimiter.canMakeRequest(ip)) {
    const timeUntilReset = rateLimiter.getTimeUntilReset(ip);
    throw new Error(`Demasiadas peticiones. Intenta de nuevo en ${Math.ceil(timeUntilReset / 1000)} segundos.`);
  }
  return true;
}
