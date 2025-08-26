import { NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/lib/db-utils';
import { redis } from '@/lib/redis';
import { CircuitBreakerManager } from '@/lib/circuit-breaker';
import { GlobalRateLimiter } from '@/lib/global-rate-limiter';
import { queryQueue } from '@/lib/query-queue';
import { orderQueue } from '@/lib/order-queue';

export async function GET(request) {
  const startTime = Date.now();
  
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    services: {},
    performance: {},
    queues: {},
    circuitBreakers: {},
    rateLimiting: {},
    errors: []
  };

  // Verificar base de datos
  try {
    const dbStartTime = Date.now();
    const dbHealth = await checkDatabaseHealth();
    const dbResponseTime = Date.now() - dbStartTime;
    
    health.services.database = {
      ...dbHealth,
      responseTime: dbResponseTime,
      timestamp: new Date().toISOString()
    };
    
    if (!dbHealth.healthy) {
      health.status = 'degraded';
      health.errors.push(`Database: ${dbHealth.message}`);
    }
  } catch (error) {
    health.services.database = { 
      healthy: false, 
      error: error.message,
      responseTime: null,
      timestamp: new Date().toISOString()
    };
    health.status = 'unhealthy';
    health.errors.push(`Database error: ${error.message}`);
  }

  // Verificar Redis
  try {
    const redisStartTime = Date.now();
    const pingResult = await redis.ping();
    const redisResponseTime = Date.now() - redisStartTime;
    
    health.services.redis = { 
      healthy: true, 
      response: pingResult,
      responseTime: redisResponseTime,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    health.services.redis = { 
      healthy: false, 
      error: error.message,
      responseTime: null,
      timestamp: new Date().toISOString()
    };
    health.status = 'degraded';
    health.errors.push(`Redis error: ${error.message}`);
  }

  // Verificar variables de entorno críticas
  const criticalEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN'
  ];

  health.services.environment = {
    healthy: true,
    missing: [],
    timestamp: new Date().toISOString()
  };

  for (const envVar of criticalEnvVars) {
    if (!process.env[envVar]) {
      health.services.environment.missing.push(envVar);
      health.services.environment.healthy = false;
    }
  }

  if (!health.services.environment.healthy) {
    health.status = health.status === 'unhealthy' ? 'unhealthy' : 'degraded';
    health.errors.push(`Missing environment variables: ${health.services.environment.missing.join(', ')}`);
  }

  // Obtener estadísticas de circuit breakers
  try {
    const cbStats = CircuitBreakerManager.getStats();
    const cbHealth = CircuitBreakerManager.getHealthStatus();
    
    health.circuitBreakers = {
      stats: cbStats,
      health: cbHealth,
      timestamp: new Date().toISOString()
    };

    if (cbHealth.health !== 'healthy') {
      health.status = health.status === 'unhealthy' ? 'unhealthy' : 'degraded';
      health.errors.push(`Circuit breakers: ${cbHealth.openBreakers} open, ${cbHealth.halfOpenBreakers} half-open`);
    }
  } catch (error) {
    health.circuitBreakers = {
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }

  // Obtener estadísticas de rate limiting
  try {
    const rateLimitStats = await GlobalRateLimiter.getStats();
    health.rateLimiting = {
      stats: rateLimitStats,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    health.rateLimiting = {
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }

  // Obtener estadísticas de colas
  try {
    const queryQueueStats = queryQueue.stats;
    const orderQueueStats = orderQueue.getStats();
    
    health.queues = {
      queryQueue: queryQueueStats,
      orderQueue: orderQueueStats,
      timestamp: new Date().toISOString()
    };

    // Verificar si las colas están sobrecargadas
    if (queryQueueStats.queueSize > 50) {
      health.status = health.status === 'unhealthy' ? 'unhealthy' : 'degraded';
      health.errors.push(`Query queue overloaded: ${queryQueueStats.queueSize} items`);
    }

    if (orderQueueStats.queueLength > 20) {
      health.status = health.status === 'unhealthy' ? 'unhealthy' : 'degraded';
      health.errors.push(`Order queue overloaded: ${orderQueueStats.queueLength} items`);
    }
  } catch (error) {
    health.queues = {
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }

  // Obtener métricas de rendimiento del sistema
  try {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    health.performance = {
      memory: {
        rss: Math.round(memUsage.rss / 1024 / 1024) + ' MB',
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB',
        external: Math.round(memUsage.external / 1024 / 1024) + ' MB'
      },
      cpu: {
        user: Math.round(cpuUsage.user / 1000) + ' ms',
        system: Math.round(cpuUsage.system / 1000) + ' ms'
      },
      uptime: Math.round(process.uptime()) + ' seconds',
      timestamp: new Date().toISOString()
    };

    // Verificar uso de memoria
    const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
    const heapTotalMB = memUsage.heapTotal / 1024 / 1024;
    const memoryUsagePercent = (heapUsedMB / heapTotalMB) * 100;

    if (memoryUsagePercent > 90) {
      health.status = health.status === 'unhealthy' ? 'unhealthy' : 'degraded';
      health.errors.push(`High memory usage: ${memoryUsagePercent.toFixed(1)}%`);
    }
  } catch (error) {
    health.performance = {
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }

  // Calcular tiempo total de respuesta
  const totalResponseTime = Date.now() - startTime;
  health.responseTime = totalResponseTime;

  // Determinar código de estado HTTP
  let statusCode = 200;
  if (health.status === 'unhealthy') {
    statusCode = 503; // Service Unavailable
  } else if (health.status === 'degraded') {
    statusCode = 200; // OK pero con advertencias
  }

  // Agregar headers informativos
  const headers = {
    'X-Health-Status': health.status,
    'X-Response-Time': totalResponseTime + 'ms',
    'X-Uptime': Math.round(process.uptime()) + 's',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  };

  // Si hay errores críticos, agregar información adicional
  if (health.errors.length > 0) {
    headers['X-Health-Errors'] = health.errors.length;
    headers['X-Health-Error-Summary'] = health.errors.slice(0, 3).join('; ');
  }

  return NextResponse.json(health, { 
    status: statusCode,
    headers
  });
}

// Endpoint para health check simple (más rápido)
export async function HEAD() {
  try {
    // Verificación rápida de servicios críticos
    const dbHealth = await checkDatabaseHealth();
    const redisPing = await redis.ping();
    
    const isHealthy = dbHealth.healthy && redisPing === 'PONG';
    
    const headers = {
      'X-Health-Status': isHealthy ? 'healthy' : 'unhealthy',
      'X-Uptime': Math.round(process.uptime()) + 's',
      'Cache-Control': 'no-cache'
    };

    return new NextResponse(null, {
      status: isHealthy ? 200 : 503,
      headers
    });
  } catch (error) {
    return new NextResponse(null, {
      status: 503,
      headers: {
        'X-Health-Status': 'unhealthy',
        'X-Health-Error': error.message
      }
    });
  }
}
