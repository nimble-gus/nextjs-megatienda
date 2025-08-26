// Sistema de Timeouts Configurables para Operaciones
import { prisma } from './prisma';

// Configuraciones de timeout por tipo de operación
const TIMEOUT_CONFIG = {
  // Timeouts para operaciones de base de datos
  database: {
    query: 10000,        // 10 segundos para consultas
    transaction: 30000,  // 30 segundos para transacciones
    connection: 5000,    // 5 segundos para conexiones
    healthCheck: 3000    // 3 segundos para health checks
  },
  // Timeouts para operaciones de caché
  cache: {
    get: 2000,           // 2 segundos para obtener de caché
    set: 3000,           // 3 segundos para guardar en caché
    delete: 2000         // 2 segundos para eliminar de caché
  },
  // Timeouts para operaciones externas
  external: {
    upload: 60000,       // 60 segundos para uploads
    api: 15000,          // 15 segundos para APIs externas
    payment: 30000       // 30 segundos para pagos
  },
  // Timeouts para operaciones del sistema
  system: {
    fileRead: 5000,      // 5 segundos para lectura de archivos
    fileWrite: 10000,    // 10 segundos para escritura de archivos
    imageProcess: 15000  // 15 segundos para procesamiento de imágenes
  }
};

// Función principal para aplicar timeout a cualquier promesa
export function withTimeout(promise, timeoutMs, operationName = 'unknown') {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new TimeoutError(`Operation timeout: ${operationName}`, timeoutMs));
      }, timeoutMs);
      
      // Limpiar timeout si la promesa se resuelve antes
      promise.finally(() => clearTimeout(timeoutId));
    })
  ]);
}

// Clase personalizada para errores de timeout
export class TimeoutError extends Error {
  constructor(message, timeoutMs) {
    super(message);
    this.name = 'TimeoutError';
    this.timeoutMs = timeoutMs;
    this.status = 408; // Request Timeout
  }
}

// Wrapper para operaciones de base de datos con timeout
export async function withDatabaseTimeout(operation, operationName = 'database') {
  const timeout = TIMEOUT_CONFIG.database.query;
  
  try {
    return await withTimeout(operation(), timeout, operationName);
  } catch (error) {
    if (error instanceof TimeoutError) {
      console.error(`❌ Database timeout in ${operationName}:`, error.message);
      throw new Error(`Database operation timed out: ${operationName}`);
    }
    throw error;
  }
}

// Wrapper para transacciones de base de datos
export async function withTransactionTimeout(operation, operationName = 'transaction') {
  const timeout = TIMEOUT_CONFIG.database.transaction;
  
  try {
    return await withTimeout(operation(), timeout, operationName);
  } catch (error) {
    if (error instanceof TimeoutError) {
      console.error(`❌ Transaction timeout in ${operationName}:`, error.message);
      // Intentar rollback si es posible
      try {
        await prisma.$executeRaw`ROLLBACK`;
      } catch (rollbackError) {
        console.error('❌ Error during rollback:', rollbackError);
      }
      throw new Error(`Database transaction timed out: ${operationName}`);
    }
    throw error;
  }
}

// Wrapper para operaciones de caché
export async function withCacheTimeout(operation, operationName = 'cache') {
  const timeout = TIMEOUT_CONFIG.cache.get;
  
  try {
    return await withTimeout(operation(), timeout, operationName);
  } catch (error) {
    if (error instanceof TimeoutError) {
      console.error(`❌ Cache timeout in ${operationName}:`, error.message);
      // Retornar null para que se use el fallback
      return null;
    }
    throw error;
  }
}

// Wrapper para operaciones externas
export async function withExternalTimeout(operation, operationName = 'external') {
  const timeout = TIMEOUT_CONFIG.external.api;
  
  try {
    return await withTimeout(operation(), timeout, operationName);
  } catch (error) {
    if (error instanceof TimeoutError) {
      console.error(`❌ External service timeout in ${operationName}:`, error.message);
      throw new Error(`External service timed out: ${operationName}`);
    }
    throw error;
  }
}

// Wrapper para operaciones de archivos
export async function withFileTimeout(operation, operationName = 'file') {
  const timeout = TIMEOUT_CONFIG.system.fileRead;
  
  try {
    return await withTimeout(operation(), timeout, operationName);
  } catch (error) {
    if (error instanceof TimeoutError) {
      console.error(`❌ File operation timeout in ${operationName}:`, error.message);
      throw new Error(`File operation timed out: ${operationName}`);
    }
    throw error;
  }
}

// Función para configurar timeouts personalizados
export function configureTimeouts(config) {
  Object.assign(TIMEOUT_CONFIG, config);
}

// Función para obtener configuración actual de timeouts
export function getTimeoutConfig() {
  return { ...TIMEOUT_CONFIG };
}

// Wrapper específico para operaciones de Prisma
export class PrismaTimeoutWrapper {
  static async findMany(model, options = {}, operationName = 'findMany') {
    return await withDatabaseTimeout(
      () => prisma[model].findMany(options),
      operationName
    );
  }

  static async findUnique(model, options = {}, operationName = 'findUnique') {
    return await withDatabaseTimeout(
      () => prisma[model].findUnique(options),
      operationName
    );
  }

  static async findFirst(model, options = {}, operationName = 'findFirst') {
    return await withDatabaseTimeout(
      () => prisma[model].findFirst(options),
      operationName
    );
  }

  static async create(model, options = {}, operationName = 'create') {
    return await withDatabaseTimeout(
      () => prisma[model].create(options),
      operationName
    );
  }

  static async update(model, options = {}, operationName = 'update') {
    return await withDatabaseTimeout(
      () => prisma[model].update(options),
      operationName
    );
  }

  static async delete(model, options = {}, operationName = 'delete') {
    return await withDatabaseTimeout(
      () => prisma[model].delete(options),
      operationName
    );
  }

  static async deleteMany(model, options = {}, operationName = 'deleteMany') {
    return await withDatabaseTimeout(
      () => prisma[model].deleteMany(options),
      operationName
    );
  }

  static async count(model, options = {}, operationName = 'count') {
    return await withDatabaseTimeout(
      () => prisma[model].count(options),
      operationName
    );
  }

  static async transaction(operations, operationName = 'transaction') {
    return await withTransactionTimeout(
      () => prisma.$transaction(operations),
      operationName
    );
  }

  static async executeRaw(query, operationName = 'executeRaw') {
    return await withDatabaseTimeout(
      () => prisma.$executeRaw(query),
      operationName
    );
  }

  static async queryRaw(query, operationName = 'queryRaw') {
    return await withDatabaseTimeout(
      () => prisma.$queryRaw(query),
      operationName
    );
  }
}

// Middleware para aplicar timeouts automáticamente en APIs
export function createTimeoutMiddleware(timeoutMs = 10000) {
  return async (request, handler) => {
    try {
      return await withTimeout(handler(request), timeoutMs, 'api-handler');
    } catch (error) {
      if (error instanceof TimeoutError) {
        return {
          success: false,
          error: 'Request timeout',
          status: 408,
          retryAfter: 30
        };
      }
      throw error;
    }
  };
}

// Función para manejar timeouts en operaciones críticas
export async function handleCriticalOperation(operation, fallback, operationName = 'critical') {
  try {
    return await withTimeout(operation(), 15000, operationName);
  } catch (error) {
    if (error instanceof TimeoutError) {
      console.error(`❌ Critical operation timeout: ${operationName}`);
      if (fallback) {
        console.log(`🔄 Using fallback for ${operationName}`);
        return await fallback();
      }
    }
    throw error;
  }
}

// Función para retry con timeout
export async function retryWithTimeout(operation, maxRetries = 3, timeoutMs = 5000, operationName = 'retry') {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await withTimeout(operation(), timeoutMs, `${operationName}-attempt-${attempt}`);
    } catch (error) {
      lastError = error;
      
      if (error instanceof TimeoutError) {
        console.error(`❌ Timeout on attempt ${attempt}/${maxRetries} for ${operationName}`);
      }
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Esperar antes del siguiente intento (backoff exponencial)
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}
