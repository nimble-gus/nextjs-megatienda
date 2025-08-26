const { redis } = require('../src/lib/redis');

async function debugRateLimit() {
  console.log('🔍 Debuggeando Rate Limiting...\n');
  
  try {
    // 1. Verificar todas las claves de rate limiting
    console.log('📋 Todas las claves de rate limiting:');
    const allKeys = await redis.keys('rate_limit:*');
    
    if (allKeys.length === 0) {
      console.log('   ✅ No hay claves de rate limiting activas');
    } else {
      console.log(`   Encontradas ${allKeys.length} claves:`);
      for (const key of allKeys) {
        const value = await redis.get(key);
        const ttl = await redis.ttl(key);
        console.log(`   - ${key}: valor=${value}, TTL=${ttl}s`);
      }
    }
    
    console.log('');
    
    // 2. Verificar configuración actual
    console.log('⚙️ Configuración actual de rate limiting:');
    const isDev = process.env.NODE_ENV === 'development';
    console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`   Auth requests per minute: ${isDev ? 50 : 10}`);
    console.log(`   Auth requests per hour: ${isDev ? 500 : 100}`);
    console.log(`   Auth burst limit: ${isDev ? 15 : 5}`);
    
    console.log('');
    
    // 3. Simular una petición de login
    console.log('🧪 Simulando petición de login...');
    const testIP = '127.0.0.1';
    const authType = 'auth';
    
    const minuteKey = `rate_limit:${authType}:${testIP}:minute`;
    const hourKey = `rate_limit:${authType}:${testIP}:hour`;
    const burstKey = `rate_limit:${authType}:${testIP}:burst`;
    
    console.log(`   IP de prueba: ${testIP}`);
    console.log(`   Clave minuto: ${minuteKey}`);
    console.log(`   Clave hora: ${hourKey}`);
    console.log(`   Clave burst: ${burstKey}`);
    
    // Verificar valores actuales
    const currentMinute = await redis.get(minuteKey) || 0;
    const currentHour = await redis.get(hourKey) || 0;
    const currentBurst = await redis.get(burstKey) || 0;
    
    console.log(`   Valor actual minuto: ${currentMinute}`);
    console.log(`   Valor actual hora: ${currentHour}`);
    console.log(`   Valor actual burst: ${currentBurst}`);
    
    console.log('');
    
    // 4. Limpiar rate limits para testing
    console.log('🧹 Limpiando rate limits para testing...');
    const keysToDelete = [minuteKey, hourKey, burstKey];
    const deleted = await redis.del(...keysToDelete);
    console.log(`   ✅ Eliminadas ${deleted} claves`);
    
    console.log('');
    console.log('🎉 Rate limits limpiados! Ahora puedes intentar login nuevamente.');
    
  } catch (error) {
    console.error('❌ Error debuggeando rate limit:', error.message);
  } finally {
    await redis.quit();
  }
}

debugRateLimit();
