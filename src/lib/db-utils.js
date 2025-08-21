import { prisma } from './prisma.js';

// Configuración de reintentos
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 5000
};

// Función para ejecutar con reintentos
export async function executeWithRetry(operation, maxRetries = RETRY_CONFIG.maxRetries) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Asegurar conexión antes de cada intento
      await ensureConnection();
      
      // Ejecutar la operación
      return await operation();
      
    } catch (error) {
      lastError = error;
      
      // Solo reintentar si es un error de conexión
      const isConnectionError = 
        error.code === 'P1001' || 
        error.message.includes('Can\'t reach database server') ||
        error.message.includes('Connection') ||
        error.message.includes('timeout') ||
        error.message.includes('Engine is not yet connected') ||
        error.message.includes('GenericFailure') ||
        error.message.includes('Response from the Engine was empty');
      
      if (!isConnectionError || attempt === maxRetries) {
        throw error;
      }
      
      console.log(`🔄 Reintento ${attempt}/${maxRetries} después de error de conexión:`, error.message);
      
      // Esperar antes del siguiente intento (backoff exponencial)
      const delay = Math.min(RETRY_CONFIG.baseDelay * Math.pow(2, attempt - 1), RETRY_CONFIG.maxDelay);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Intentar reconectar
      try {
        await forceReconnect();
        console.log('✅ Reconexión exitosa');
      } catch (reconnectError) {
        console.log('⚠️ Error en reconexión:', reconnectError.message);
      }
    }
  }
  
  throw lastError;
}

// Función para asegurar conexión
export async function ensureConnection() {
  try {
    // Verificar si ya está conectado
    await prisma.$queryRaw`SELECT 1 as health_check`;
  } catch (error) {
    // Si es un error de conexión, intentar reconectar
    if (error.message.includes('Engine is not yet connected') || 
        error.message.includes('Can\'t reach database server') ||
        error.message.includes('Response from the Engine was empty')) {
      console.log('🔌 Reconectando...');
      await forceReconnect();
      
      // Verificar nuevamente después de reconectar
      try {
        await prisma.$queryRaw`SELECT 1 as health_check`;
      } catch (retryError) {
        console.log('❌ Error de base de datos:', retryError.message);
        console.log('🔍 Tipo de error:', retryError.constructor.name);
        console.log('🔍 Código de error:', retryError.code);
        throw retryError;
      }
    } else {
      throw error;
    }
  }
}

// Función para forzar reconexión
export async function forceReconnect() {
  try {
    // Desconectar primero
    await prisma.$disconnect();
    // Esperar un momento
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Intentar reconectar múltiples veces
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await prisma.$connect();
        console.log('✅ Reconexión forzada exitosa');
        return;
      } catch (connectError) {
        console.log(`⚠️ Intento ${attempt}/3 de reconexión falló:`, connectError.message);
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        } else {
          throw connectError;
        }
      }
    }
  } catch (error) {
    console.log('❌ Error en reconexión forzada:', error.message);
    throw error;
  }
}

// Función para verificar la salud de la conexión
export async function checkDatabaseHealth() {
  try {
    await ensureConnection();
    return { healthy: true, message: 'Conexión estable' };
  } catch (error) {
    return { 
      healthy: false, 
      message: error.message,
      code: error.code 
    };
  }
}

// Función para limpiar conexiones
export async function cleanupConnections() {
  try {
    await prisma.$disconnect();
    console.log('✅ Conexiones limpiadas');
  } catch (error) {
    console.log('⚠️ Error limpiando conexiones:', error.message);
  }
}

// Función para manejar errores de Prisma de manera más robusta
export async function handlePrismaError(error, context = '') {
  console.log(`❌ Error de base de datos:`, error.message);
  console.log(`🔍 Tipo de error:`, error.constructor.name);
  console.log(`🔍 Código de error:`, error.code);
  
  if (context) {
    console.log(`🔍 Contexto:`, context);
  }
  
  // Si es un error de conexión, intentar reconectar
  if (error.message.includes('Engine is not yet connected') ||
      error.message.includes('Response from the Engine was empty')) {
    try {
      await forceReconnect();
      return { success: true, message: 'Reconexión exitosa' };
    } catch (reconnectError) {
      return { success: false, message: 'Error en reconexión', error: reconnectError };
    }
  }
  
  return { success: false, message: 'Error no relacionado con conexión', error };
}
