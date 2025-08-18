// Script de prueba de estrés para filtros
const BASE_URL = 'http://localhost:3000';

async function testStressFilters() {
  console.log('🧪 Iniciando prueba de estrés de filtros...\n');

  const results = {
    total: 0,
    success: 0,
    failed: 0,
    errors: []
  };

  // Simular múltiples consultas simultáneas
  const concurrentRequests = 10;
  const requests = [];

  console.log(`📊 Ejecutando ${concurrentRequests} consultas simultáneas...\n`);

  for (let i = 0; i < concurrentRequests; i++) {
    const request = async () => {
      try {
        results.total++;
        
        // Simular diferentes filtros
        const filters = [
          '?page=1&limit=5',
          '?page=1&limit=5&minPrice=100&maxPrice=500',
          '?page=1&limit=5&colors=1&colors=2',
          '?page=1&limit=5&category=1',
          '?page=1&limit=5&minPrice=200&maxPrice=800&colors=1'
        ];
        
        const randomFilter = filters[Math.floor(Math.random() * filters.length)];
        const url = `${BASE_URL}/api/catalog/products${randomFilter}`;
        
        console.log(`🔄 Consulta ${i + 1}: ${url}`);
        
        const startTime = Date.now();
        const response = await fetch(url);
        const endTime = Date.now();
        
        if (response.ok) {
          const data = await response.json();
          results.success++;
          console.log(`✅ Consulta ${i + 1} exitosa (${endTime - startTime}ms) - ${data.products?.length || 0} productos`);
        } else {
          results.failed++;
          const errorText = await response.text();
          results.errors.push(`Consulta ${i + 1}: ${response.status} - ${errorText}`);
          console.log(`❌ Consulta ${i + 1} falló (${response.status})`);
        }
        
      } catch (error) {
        results.failed++;
        results.errors.push(`Consulta ${i + 1}: ${error.message}`);
        console.log(`❌ Consulta ${i + 1} error: ${error.message}`);
      }
    };
    
    requests.push(request());
  }

  // Esperar a que todas las consultas terminen
  await Promise.all(requests);

  // Mostrar resultados
  console.log('\n📈 RESULTADOS DE LA PRUEBA DE ESTRÉS:');
  console.log('=====================================');
  console.log(`Total de consultas: ${results.total}`);
  console.log(`✅ Exitosas: ${results.success}`);
  console.log(`❌ Fallidas: ${results.failed}`);
  console.log(`📊 Tasa de éxito: ${((results.success / results.total) * 100).toFixed(2)}%`);
  
  if (results.errors.length > 0) {
    console.log('\n🚨 Errores encontrados:');
    results.errors.forEach(error => console.log(`  - ${error}`));
  }

  // Verificar estado del servidor
  try {
    console.log('\n🔍 Verificando estado del servidor...');
    const healthResponse = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthResponse.json();
    console.log(`Estado de la BD: ${healthData.status}`);
  } catch (error) {
    console.log(`❌ No se pudo verificar el estado del servidor: ${error.message}`);
  }

  console.log('\n🎯 CONCLUSIÓN:');
  if (results.failed === 0) {
    console.log('✅ La prueba de estrés fue EXITOSA - No se detectaron errores');
  } else {
    console.log('⚠️ La prueba de estrés detectó algunos errores');
  }
}

// Ejecutar prueba
testStressFilters();
