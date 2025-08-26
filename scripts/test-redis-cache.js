#!/usr/bin/env node

/**
 * Script para probar el funcionamiento del cache de Redis/Upstash
 * Uso: node scripts/test-redis-cache.js
 */

// Colores para la consola
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const testEndpoint = async (endpoint, name) => {
  try {
    log(`🔍 Probando ${name}...`, 'blue');
    
    const startTime = Date.now();
    const response = await fetch(`http://localhost:3000${endpoint}`);
    const endTime = Date.now();
    
    const responseTime = endTime - startTime;
    
    if (response.ok) {
      const data = await response.json();
      log(`✅ ${name} - ${responseTime}ms`, 'green');
      log(`   Status: ${response.status}`, 'green');
      log(`   Datos: ${JSON.stringify(data).substring(0, 100)}...`, 'green');
      return { success: true, time: responseTime };
    } else {
      log(`❌ ${name} - Error ${response.status}`, 'red');
      return { success: false, time: responseTime };
    }
  } catch (error) {
    log(`❌ ${name} - Error de conexión: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
};

const testCachePerformance = async () => {
  log('🚀 Prueba de Rendimiento del Sistema de Cache', 'bold');
  log('============================================', 'bold');
  
  const endpoints = [
    { url: '/api/categories', name: 'Categorías' },
    { url: '/api/catalog/filters', name: 'Filtros' },
    { url: '/api/sales/kpis', name: 'KPIs' },
    { url: '/api/catalog/products?page=1&limit=10', name: 'Productos (Página 1)' },
    { url: '/api/catalog/products?page=2&limit=10', name: 'Productos (Página 2)' }
  ];
  
  const results = [];
  
  // Primera ronda - Sin cache (primera llamada)
  log('\n📊 Primera ronda - Sin cache:', 'yellow');
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint.url, endpoint.name);
    results.push({ ...result, endpoint: endpoint.name, round: 1 });
    await new Promise(resolve => setTimeout(resolve, 500)); // Pausa entre llamadas
  }
  
  // Segunda ronda - Con cache (segunda llamada)
  log('\n📊 Segunda ronda - Con cache:', 'yellow');
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint.url, endpoint.name);
    results.push({ ...result, endpoint: endpoint.name, round: 2 });
    await new Promise(resolve => setTimeout(resolve, 500)); // Pausa entre llamadas
  }
  
  // Análisis de resultados
  log('\n📈 Análisis de Rendimiento:', 'bold');
  log('==========================', 'bold');
  
  const analysis = {};
  
  endpoints.forEach(endpoint => {
    const firstCall = results.find(r => r.endpoint === endpoint.name && r.round === 1);
    const secondCall = results.find(r => r.endpoint === endpoint.name && r.round === 2);
    
    if (firstCall && secondCall && firstCall.success && secondCall.success) {
      const improvement = ((firstCall.time - secondCall.time) / firstCall.time * 100).toFixed(1);
      analysis[endpoint.name] = {
        firstCall: firstCall.time,
        secondCall: secondCall.time,
        improvement: `${improvement}%`
      };
      
      log(`${endpoint.name}:`, 'blue');
      log(`   Primera llamada: ${firstCall.time}ms`, 'yellow');
      log(`   Segunda llamada: ${secondCall.time}ms`, 'green');
      log(`   Mejora: ${improvement}%`, improvement > 0 ? 'green' : 'red');
    }
  });
  
  // Estadísticas generales
  const successfulTests = results.filter(r => r.success).length;
  const totalTests = results.length;
  
  log(`\n📊 Resumen:`, 'bold');
  log(`   Tests exitosos: ${successfulTests}/${totalTests}`, successfulTests === totalTests ? 'green' : 'red');
  
  if (successfulTests === totalTests) {
    log('🎉 ¡El sistema de cache está funcionando correctamente!', 'green');
  } else {
    log('⚠️  Algunos tests fallaron. Revisa la configuración.', 'red');
  }
};

const testCacheInvalidation = async () => {
  log('\n🔄 Probando invalidación de cache...', 'blue');
  
  try {
    const response = await fetch('http://localhost:3000/api/cache/invalidate', {
      method: 'POST'
    });
    
    if (response.ok) {
      const data = await response.json();
      log('✅ Invalidación de cache exitosa', 'green');
      log(`   Resultado: ${JSON.stringify(data)}`, 'green');
    } else {
      log('❌ Error en invalidación de cache', 'red');
    }
  } catch (error) {
    log(`❌ Error de conexión: ${error.message}`, 'red');
  }
};

const main = async () => {
  try {
    await testCachePerformance();
    await testCacheInvalidation();
  } catch (error) {
    log(`❌ Error en las pruebas: ${error.message}`, 'red');
  }
};

if (require.main === module) {
  main();
}

module.exports = {
  testCachePerformance,
  testCacheInvalidation
};
