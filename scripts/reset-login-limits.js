const { redis } = require('../src/lib/redis');

async function resetLoginLimits() {
  console.log('🔄 Reseteando límites de login...\n');
  
  try {
    // Obtener la IP del cliente (asumiendo localhost para desarrollo)
    const clientIP = '127.0.0.1';
    
    // Claves específicas para rate limiting de auth
    const authKeys = [
      `rate_limit:auth:${clientIP}:minute`,
      `rate_limit:auth:${clientIP}:hour`,
      `rate_limit:auth:${clientIP}:burst`
    ];
    
    console.log('🔍 Buscando claves de rate limiting para auth...');
    
    // Verificar si existen las claves
    for (const key of authKeys) {
      const exists = await redis.exists(key);
      if (exists) {
        console.log(`   Encontrada: ${key}`);
        await redis.del(key);
        console.log(`   ✅ Eliminada: ${key}`);
      } else {
        console.log(`   No encontrada: ${key}`);
      }
    }
    
    // También limpiar cualquier clave que contenga "auth"
    const allKeys = await redis.keys('rate_limit:*auth*');
    if (allKeys.length > 0) {
      console.log(`\n🗑️ Limpiando ${allKeys.length} claves adicionales de auth:`);
      for (const key of allKeys) {
        await redis.del(key);
        console.log(`   ✅ Eliminada: ${key}`);
      }
    }
    
    console.log('\n🎉 Límites de login reseteados exitosamente!');
    console.log('🔄 Ahora puedes intentar hacer login nuevamente');
    
  } catch (error) {
    console.error('❌ Error reseteando límites:', error.message);
  } finally {
    await redis.quit();
  }
}

resetLoginLimits();
