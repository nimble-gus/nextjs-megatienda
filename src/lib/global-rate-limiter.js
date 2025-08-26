// Rate Limiter Global para todas las APIs
import { redis } from './redis';

export class GlobalRateLimiter {
  // Configuraciones por tipo de endpoint
  static configs = {
    // APIs públicas - más permisivas
    public: {
      requestsPerMinute: 100,
      requestsPerHour: 1000,
      burstLimit: 20
    },
    // APIs de autenticación - más permisivas en desarrollo
    auth: {
      requestsPerMinute: process.env.NODE_ENV === 'development' ? 50 : 10,
      requestsPerHour: process.env.NODE_ENV === 'development' ? 500 : 100,
      burstLimit: process.env.NODE_ENV === 'development' ? 15 : 5
    },
    // APIs de carrito - moderadas
    cart: {
      requestsPerMinute: 30,
      requestsPerHour: 300,
      burstLimit: 10
    },
    // APIs de checkout - muy restrictivas
    checkout: {
      requestsPerMinute: 5,
      requestsPerHour: 50,
      burstLimit: 3
    },
    // APIs de admin - moderadas
    admin: {
      requestsPerMinute: 50,
      requestsPerHour: 500,
      burstLimit: 15
    }
  };

  // Verificar límites para un identificador específico
  static async checkLimit(identifier, type = 'public') {
    const config = this.configs[type] || this.configs.public;
    
    try {
      // Verificar límite por minuto
      const minuteKey = `rate_limit:${type}:${identifier}:minute`;
      const minuteCount = await redis.incr(minuteKey);
      
      if (minuteCount === 1) {
        await redis.expire(minuteKey, 60); // 1 minuto
      }
      
      if (minuteCount > config.requestsPerMinute) {
        return {
          allowed: false,
          limit: config.requestsPerMinute,
          remaining: 0,
          resetTime: await redis.ttl(minuteKey),
          type: 'minute'
        };
      }

      // Verificar límite por hora
      const hourKey = `rate_limit:${type}:${identifier}:hour`;
      const hourCount = await redis.incr(hourKey);
      
      if (hourCount === 1) {
        await redis.expire(hourKey, 3600); // 1 hora
      }
      
      if (hourCount > config.requestsPerHour) {
        return {
          allowed: false,
          limit: config.requestsPerHour,
          remaining: 0,
          resetTime: await redis.ttl(hourKey),
          type: 'hour'
        };
      }

      // Verificar burst limit (ventana de 10 segundos)
      const burstKey = `rate_limit:${type}:${identifier}:burst`;
      const burstCount = await redis.incr(burstKey);
      
      if (burstCount === 1) {
        await redis.expire(burstKey, 10); // 10 segundos
      }
      
      if (burstCount > config.burstLimit) {
        return {
          allowed: false,
          limit: config.burstLimit,
          remaining: 0,
          resetTime: await redis.ttl(burstKey),
          type: 'burst'
        };
      }

      return {
        allowed: true,
        limit: config.requestsPerMinute,
        remaining: Math.max(0, config.requestsPerMinute - minuteCount),
        resetTime: await redis.ttl(minuteKey),
        type: 'minute'
      };

    } catch (error) {
      console.error('❌ Error en rate limiting:', error);
      // En caso de error de Redis, permitir la petición
      return {
        allowed: true,
        limit: config.requestsPerMinute,
        remaining: 1,
        resetTime: 60,
        type: 'fallback'
      };
    }
  }

  // Obtener información de rate limit sin incrementar
  static async getLimitInfo(identifier, type = 'public') {
    const config = this.configs[type] || this.configs.public;
    
    try {
      const minuteKey = `rate_limit:${type}:${identifier}:minute`;
      const minuteCount = await redis.get(minuteKey) || 0;
      const minuteTTL = await redis.ttl(minuteKey);
      
      const hourKey = `rate_limit:${type}:${identifier}:hour`;
      const hourCount = await redis.get(hourKey) || 0;
      const hourTTL = await redis.ttl(hourKey);
      
      return {
        minute: {
          used: parseInt(minuteCount),
          limit: config.requestsPerMinute,
          remaining: Math.max(0, config.requestsPerMinute - parseInt(minuteCount)),
          resetTime: minuteTTL
        },
        hour: {
          used: parseInt(hourCount),
          limit: config.requestsPerHour,
          remaining: Math.max(0, config.requestsPerHour - parseInt(hourCount)),
          resetTime: hourTTL
        }
      };
    } catch (error) {
      console.error('❌ Error obteniendo info de rate limit:', error);
      return null;
    }
  }

  // Limpiar rate limits para un identificador (útil para testing)
  static async clearLimits(identifier, type = 'public') {
    try {
      const keys = [
        `rate_limit:${type}:${identifier}:minute`,
        `rate_limit:${type}:${identifier}:hour`,
        `rate_limit:${type}:${identifier}:burst`
      ];
      
      await redis.del(...keys);
      return true;
    } catch (error) {
      console.error('❌ Error limpiando rate limits:', error);
      return false;
    }
  }

  // Obtener estadísticas de rate limiting
  static async getStats() {
    try {
      const keys = await redis.keys('rate_limit:*');
      const stats = {
        totalKeys: keys.length,
        byType: {},
        byTimeframe: {
          minute: 0,
          hour: 0,
          burst: 0
        }
      };

      for (const key of keys) {
        const parts = key.split(':');
        const type = parts[1];
        const timeframe = parts[3];
        
        if (!stats.byType[type]) {
          stats.byType[type] = 0;
        }
        stats.byType[type]++;
        
        if (stats.byTimeframe[timeframe] !== undefined) {
          stats.byTimeframe[timeframe]++;
        }
      }

      return stats;
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas de rate limiting:', error);
      return null;
    }
  }
}

// Función helper para aplicar rate limiting en APIs
export async function applyGlobalRateLimit(request, type = 'public') {
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  const result = await GlobalRateLimiter.checkLimit(ip, type);
  
  if (!result.allowed) {
    const error = new Error(`Rate limit exceeded. ${result.type} limit reached.`);
    error.status = 429;
    error.retryAfter = result.resetTime;
    error.limitInfo = result;
    throw error;
  }
  
  return result;
}

// Función para obtener headers de rate limit
export function getRateLimitHeaders(result) {
  return {
    'X-RateLimit-Limit': result.limit,
    'X-RateLimit-Remaining': result.remaining,
    'X-RateLimit-Reset': result.resetTime,
    'Retry-After': result.resetTime
  };
}

// Middleware para aplicar rate limiting automáticamente
export function createRateLimitMiddleware(type = 'public') {
  return async (request) => {
    try {
      const result = await applyGlobalRateLimit(request, type);
      return { success: true, rateLimitInfo: result };
    } catch (error) {
      return { 
        success: false, 
        error: error.message, 
        status: error.status || 429,
        retryAfter: error.retryAfter
      };
    }
  };
}
