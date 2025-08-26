#!/usr/bin/env node

const { redis } = require('../src/lib/redis');

async function clearRateLimits() {
  console.log('🧹 Limpiando rate limits...\n');
  
  try {
    // Obtener todas las claves de rate limiting
    const keys = await redis.keys('rate_limit:*');
    
    if (keys.length === 0) {
      console.log('✅ No hay rate limits activos');
      return;
    }
    
    console.log(`📋 Encontradas ${keys.length} claves de rate limiting:`);
    keys.forEach(key => {
      console.log(`   - ${key}`);
    });
    
    // Eliminar todas las claves
    const deleted = await redis.del(...keys);
    console.log(`\n🗑️ Eliminadas ${deleted} claves de rate limiting`);
    
    console.log('\n✅ Rate limits limpiados exitosamente!');
    console.log('🔄 Ahora puedes intentar hacer login nuevamente');
    
  } catch (error) {
    console.error('❌ Error limpiando rate limits:', error.message);
  } finally {
    await redis.quit();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  clearRateLimits();
}

module.exports = clearRateLimits;
