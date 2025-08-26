#!/usr/bin/env node

/**
 * Script de Prueba de Carga para Validar Optimizaciones
 * 
 * Uso:
 * node scripts/load-test.js [opciones]
 * 
 * Opciones:
 * --url <base-url>     URL base del servidor (default: http://localhost:3000)
 * --users <number>      Número de usuarios simultáneos (default: 10)
 * --duration <seconds>  Duración de la prueba en segundos (default: 60)
 * --ramp-up <seconds>   Tiempo de rampa para alcanzar usuarios máximos (default: 10)
 * --endpoint <path>     Endpoint específico a probar (default: /api/catalog/products)
 */

const https = require('https');
const http = require('http');

class LoadTester {
  constructor(options = {}) {
    this.baseUrl = options.url || 'http://localhost:3000';
    this.maxUsers = options.users || 10;
    this.duration = options.duration || 60;
    this.rampUpTime = options.rampUp || 10;
    this.endpoint = options.endpoint || '/api/catalog/products';
    
    this.results = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      responseTimes: [],
      errors: [],
      startTime: null,
      endTime: null
    };
    
    this.activeUsers = 0;
    this.isRunning = false;
  }

  // Realizar una petición HTTP
  async makeRequest(url) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const protocol = url.startsWith('https') ? https : http;
      
      const req = protocol.get(url, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          const responseTime = Date.now() - startTime;
          resolve({
            statusCode: res.statusCode,
            responseTime,
            headers: res.headers,
            data: data
          });
        });
      });
      
      req.on('error', (error) => {
        const responseTime = Date.now() - startTime;
        reject({
          error: error.message,
          responseTime
        });
      });
      
      req.setTimeout(10000, () => {
        req.destroy();
        reject({
          error: 'Request timeout',
          responseTime: Date.now() - startTime
        });
      });
    });
  }

  // Simular un usuario
  async simulateUser(userId) {
    const userStartTime = Date.now();
    let requestCount = 0;
    
    while (this.isRunning && (Date.now() - userStartTime) < this.duration * 1000) {
      try {
        const url = `${this.baseUrl}${this.endpoint}?page=1&limit=12`;
        const result = await this.makeRequest(url);
        
        this.results.totalRequests++;
        this.results.responseTimes.push(result.responseTime);
        
        if (result.statusCode >= 200 && result.statusCode < 300) {
          this.results.successfulRequests++;
        } else {
          this.results.failedRequests++;
          this.results.errors.push({
            userId,
            statusCode: result.statusCode,
            responseTime: result.responseTime,
            timestamp: new Date().toISOString()
          });
        }
        
        requestCount++;
        
        // Esperar entre peticiones (1-3 segundos)
        const delay = Math.random() * 2000 + 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        
      } catch (error) {
        this.results.totalRequests++;
        this.results.failedRequests++;
        this.results.errors.push({
          userId,
          error: error.error,
          responseTime: error.responseTime,
          timestamp: new Date().toISOString()
        });
        
        // Esperar un poco más si hay error
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log(`👤 Usuario ${userId} completado: ${requestCount} peticiones`);
  }

  // Iniciar prueba de carga
  async start() {
    console.log('🚀 Iniciando prueba de carga...');
    console.log(`📊 Configuración:`);
    console.log(`   - URL: ${this.baseUrl}`);
    console.log(`   - Endpoint: ${this.endpoint}`);
    console.log(`   - Usuarios máximos: ${this.maxUsers}`);
    console.log(`   - Duración: ${this.duration} segundos`);
    console.log(`   - Rampa: ${this.rampUpTime} segundos`);
    console.log('');
    
    this.isRunning = true;
    this.results.startTime = Date.now();
    
    // Crear usuarios gradualmente
    const userInterval = this.rampUpTime * 1000 / this.maxUsers;
    const users = [];
    
    for (let i = 1; i <= this.maxUsers; i++) {
      setTimeout(() => {
        users.push(this.simulateUser(i));
        this.activeUsers++;
        console.log(`👤 Usuario ${i} iniciado (${this.activeUsers} activos)`);
      }, userInterval * (i - 1));
    }
    
    // Esperar a que termine la prueba
    await new Promise(resolve => {
      setTimeout(() => {
        this.isRunning = false;
        resolve();
      }, this.duration * 1000);
    });
    
    // Esperar a que todos los usuarios terminen
    await Promise.all(users);
    
    this.results.endTime = Date.now();
    this.generateReport();
  }

  // Generar reporte
  generateReport() {
    const totalTime = (this.results.endTime - this.results.startTime) / 1000;
    const avgResponseTime = this.results.responseTimes.length > 0 
      ? this.results.responseTimes.reduce((a, b) => a + b, 0) / this.results.responseTimes.length 
      : 0;
    
    const sortedResponseTimes = [...this.results.responseTimes].sort((a, b) => a - b);
    const p50 = sortedResponseTimes[Math.floor(sortedResponseTimes.length * 0.5)] || 0;
    const p95 = sortedResponseTimes[Math.floor(sortedResponseTimes.length * 0.95)] || 0;
    const p99 = sortedResponseTimes[Math.floor(sortedResponseTimes.length * 0.99)] || 0;
    
    const successRate = (this.results.successfulRequests / this.results.totalRequests) * 100;
    const requestsPerSecond = this.results.totalRequests / totalTime;
    
    console.log('\n📈 REPORTE DE PRUEBA DE CARGA');
    console.log('=' .repeat(50));
    console.log(`⏱️  Duración total: ${totalTime.toFixed(2)} segundos`);
    console.log(`📊 Total de peticiones: ${this.results.totalRequests}`);
    console.log(`✅ Peticiones exitosas: ${this.results.successfulRequests}`);
    console.log(`❌ Peticiones fallidas: ${this.results.failedRequests}`);
    console.log(`📈 Tasa de éxito: ${successRate.toFixed(2)}%`);
    console.log(`🚀 Peticiones por segundo: ${requestsPerSecond.toFixed(2)}`);
    console.log('');
    console.log('⏱️  Tiempos de respuesta:');
    console.log(`   - Promedio: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`   - P50 (mediana): ${p50.toFixed(2)}ms`);
    console.log(`   - P95: ${p95.toFixed(2)}ms`);
    console.log(`   - P99: ${p99.toFixed(2)}ms`);
    console.log(`   - Mínimo: ${Math.min(...this.results.responseTimes).toFixed(2)}ms`);
    console.log(`   - Máximo: ${Math.max(...this.results.responseTimes).toFixed(2)}ms`);
    console.log('');
    
    if (this.results.errors.length > 0) {
      console.log('❌ Errores encontrados:');
      const errorTypes = {};
      this.results.errors.forEach(error => {
        const key = error.error || `HTTP ${error.statusCode}`;
        errorTypes[key] = (errorTypes[key] || 0) + 1;
      });
      
      Object.entries(errorTypes).forEach(([error, count]) => {
        console.log(`   - ${error}: ${count} veces`);
      });
    }
    
    // Evaluación de rendimiento
    console.log('\n🎯 EVALUACIÓN DE RENDIMIENTO');
    console.log('=' .repeat(50));
    
    let score = 0;
    const evaluations = [];
    
    // Evaluar tasa de éxito
    if (successRate >= 99) {
      score += 25;
      evaluations.push('✅ Tasa de éxito excelente (≥99%)');
    } else if (successRate >= 95) {
      score += 20;
      evaluations.push('✅ Tasa de éxito buena (≥95%)');
    } else if (successRate >= 90) {
      score += 15;
      evaluations.push('⚠️  Tasa de éxito aceptable (≥90%)');
    } else {
      evaluations.push('❌ Tasa de éxito deficiente (<90%)');
    }
    
    // Evaluar tiempo de respuesta promedio
    if (avgResponseTime < 500) {
      score += 25;
      evaluations.push('✅ Tiempo de respuesta excelente (<500ms)');
    } else if (avgResponseTime < 1000) {
      score += 20;
      evaluations.push('✅ Tiempo de respuesta bueno (<1s)');
    } else if (avgResponseTime < 2000) {
      score += 15;
      evaluations.push('⚠️  Tiempo de respuesta aceptable (<2s)');
    } else {
      evaluations.push('❌ Tiempo de respuesta lento (≥2s)');
    }
    
    // Evaluar P95
    if (p95 < 1000) {
      score += 25;
      evaluations.push('✅ P95 excelente (<1s)');
    } else if (p95 < 2000) {
      score += 20;
      evaluations.push('✅ P95 bueno (<2s)');
    } else if (p95 < 5000) {
      score += 15;
      evaluations.push('⚠️  P95 aceptable (<5s)');
    } else {
      evaluations.push('❌ P95 deficiente (≥5s)');
    }
    
    // Evaluar throughput
    if (requestsPerSecond >= 10) {
      score += 25;
      evaluations.push('✅ Throughput excelente (≥10 req/s)');
    } else if (requestsPerSecond >= 5) {
      score += 20;
      evaluations.push('✅ Throughput bueno (≥5 req/s)');
    } else if (requestsPerSecond >= 2) {
      score += 15;
      evaluations.push('⚠️  Throughput aceptable (≥2 req/s)');
    } else {
      evaluations.push('❌ Throughput deficiente (<2 req/s)');
    }
    
    console.log(`📊 Puntuación total: ${score}/100`);
    console.log('');
    evaluations.forEach(eval => console.log(eval));
    
    console.log('\n🎯 RECOMENDACIONES:');
    if (score >= 90) {
      console.log('✅ El sistema está listo para producción');
    } else if (score >= 70) {
      console.log('⚠️  El sistema necesita algunas optimizaciones');
    } else {
      console.log('❌ El sistema necesita optimizaciones significativas');
    }
    
    // Guardar resultados en archivo
    this.saveResults();
  }

  // Guardar resultados en archivo
  saveResults() {
    const fs = require('fs');
    const results = {
      ...this.results,
      config: {
        baseUrl: this.baseUrl,
        endpoint: this.endpoint,
        maxUsers: this.maxUsers,
        duration: this.duration,
        rampUpTime: this.rampUpTime
      },
      timestamp: new Date().toISOString()
    };
    
    const filename = `load-test-results-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(results, null, 2));
    console.log(`\n💾 Resultados guardados en: ${filename}`);
  }
}

// Función principal
async function main() {
  const args = process.argv.slice(2);
  const options = {};
  
  // Parsear argumentos
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i];
    const value = args[i + 1];
    
    if (key === '--url') options.url = value;
    else if (key === '--users') options.users = parseInt(value);
    else if (key === '--duration') options.duration = parseInt(value);
    else if (key === '--ramp-up') options.rampUp = parseInt(value);
    else if (key === '--endpoint') options.endpoint = value;
  }
  
  const loadTester = new LoadTester(options);
  
  try {
    await loadTester.start();
  } catch (error) {
    console.error('❌ Error durante la prueba de carga:', error);
    process.exit(1);
  }
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  main();
}

module.exports = LoadTester;
