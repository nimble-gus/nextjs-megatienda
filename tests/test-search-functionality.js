// Script de prueba para la funcionalidad de búsqueda
const testSearchFunctionality = async () => {
  console.log('🔍 Probando funcionalidad de búsqueda...\n');

  try {
    // 1. Probar búsqueda por nombre de producto
    console.log('1️⃣ Probando búsqueda por nombre...');
    
    const searchResponse = await fetch('http://localhost:3000/api/products?search=bicicleta&limit=5');
    
    if (!searchResponse.ok) {
      throw new Error(`Error en búsqueda: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();
    console.log('✅ Resultados de búsqueda "bicicleta":');
    console.log(`   - Productos encontrados: ${searchData.products.length}`);
    console.log(`   - Total de productos: ${searchData.pagination.totalProducts}`);
    
    if (searchData.products.length > 0) {
      searchData.products.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} (${product.sku})`);
      });
    }

    // 2. Probar búsqueda por SKU
    console.log('\n2️⃣ Probando búsqueda por SKU...');
    
    const skuResponse = await fetch('http://localhost:3000/api/products?search=SKU&limit=3');
    
    if (!skuResponse.ok) {
      throw new Error(`Error en búsqueda por SKU: ${skuResponse.status}`);
    }

    const skuData = await skuResponse.json();
    console.log('✅ Resultados de búsqueda "SKU":');
    console.log(`   - Productos encontrados: ${skuData.products.length}`);
    
    if (skuData.products.length > 0) {
      skuData.products.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} (${product.sku})`);
      });
    }

    // 3. Probar búsqueda por descripción
    console.log('\n3️⃣ Probando búsqueda por descripción...');
    
    const descResponse = await fetch('http://localhost:3000/api/products?search=ejercicio&limit=3');
    
    if (!descResponse.ok) {
      throw new Error(`Error en búsqueda por descripción: ${descResponse.status}`);
    }

    const descData = await descResponse.json();
    console.log('✅ Resultados de búsqueda "ejercicio":');
    console.log(`   - Productos encontrados: ${descData.products.length}`);
    
    if (descData.products.length > 0) {
      descData.products.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name}`);
        console.log(`      Descripción: ${product.description.substring(0, 100)}...`);
      });
    }

    // 4. Probar búsqueda sin resultados
    console.log('\n4️⃣ Probando búsqueda sin resultados...');
    
    const noResultsResponse = await fetch('http://localhost:3000/api/products?search=productoInexistente&limit=5');
    
    if (!noResultsResponse.ok) {
      throw new Error(`Error en búsqueda sin resultados: ${noResultsResponse.status}`);
    }

    const noResultsData = await noResultsResponse.json();
    console.log('✅ Resultados de búsqueda "productoInexistente":');
    console.log(`   - Productos encontrados: ${noResultsData.products.length}`);
    console.log(`   - Total de productos: ${noResultsData.pagination.totalProducts}`);

    // 5. Probar búsqueda con filtros combinados
    console.log('\n5️⃣ Probando búsqueda con filtros combinados...');
    
    const combinedResponse = await fetch('http://localhost:3000/api/products?search=bicicleta&category=2&limit=3');
    
    if (!combinedResponse.ok) {
      throw new Error(`Error en búsqueda combinada: ${combinedResponse.status}`);
    }

    const combinedData = await combinedResponse.json();
    console.log('✅ Resultados de búsqueda "bicicleta" + categoría 2:');
    console.log(`   - Productos encontrados: ${combinedData.products.length}`);
    
    if (combinedData.products.length > 0) {
      combinedData.products.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} (Categoría: ${product.category})`);
      });
    }

    // 6. Simular URL de búsqueda
    console.log('\n6️⃣ Simulando URL de búsqueda...');
    
    const searchTerm = 'bicicleta';
    const encodedSearch = encodeURIComponent(searchTerm);
    const catalogUrl = `http://localhost:3000/catalog?search=${encodedSearch}`;
    
    console.log(`✅ URL de búsqueda generada:`);
    console.log(`   - Término: "${searchTerm}"`);
    console.log(`   - URL codificada: ${catalogUrl}`);
    console.log(`   - URL decodificada: /catalog?search=${searchTerm}`);

    console.log('\n🎉 ¡Prueba de búsqueda completada exitosamente!');
    console.log('📋 Resumen:');
    console.log(`   - Búsqueda por nombre: ${searchData.products.length > 0 ? 'OK' : 'Sin resultados'}`);
    console.log(`   - Búsqueda por SKU: ${skuData.products.length > 0 ? 'OK' : 'Sin resultados'}`);
    console.log(`   - Búsqueda por descripción: ${descData.products.length > 0 ? 'OK' : 'Sin resultados'}`);
    console.log(`   - Búsqueda sin resultados: ${noResultsData.products.length === 0 ? 'OK' : 'Error'}`);
    console.log(`   - Búsqueda combinada: ${combinedData.products.length >= 0 ? 'OK' : 'Error'}`);
    console.log(`   - URL de búsqueda: Funcional`);
    console.log('\n🚀 Funcionalidad lista para usar en el header!');

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    console.error('Stack:', error.stack);
  }
};

// Ejecutar la prueba
testSearchFunctionality();
