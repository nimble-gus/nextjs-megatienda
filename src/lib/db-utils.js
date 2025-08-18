import { prisma } from './prisma';

// Función para ejecutar queries con reintentos
export async function executeWithRetry(operation, maxRetries = 3, delay = 1000) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Verificar conexión antes de ejecutar
      await ensureConnection();
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Solo reintentar si es un error de conexión
      const isConnectionError = 
        error.code === 'P1001' || 
        error.message.includes('Can\'t reach database server') ||
        error.message.includes('Connection') ||
        error.message.includes('timeout') ||
        error.message.includes('Engine is not yet connected');
      
      if (!isConnectionError || attempt === maxRetries) {
        throw error;
      }
      
      console.log(`🔄 Reintento ${attempt}/${maxRetries} después de error de conexión:`, error.message);
      
      // Esperar antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
      
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
    if (error.message.includes('Engine is not yet connected') || 
        error.message.includes('Can\'t reach database server')) {
      console.log('🔌 Reconectando...');
      await forceReconnect();
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
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Reconectar
    await prisma.$connect();
    console.log('✅ Reconexión forzada exitosa');
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
