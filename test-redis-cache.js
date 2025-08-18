// Script para probar el caché de Redis
const BASE_URL = 'http://localhost:3000'; // Puerto 3000 donde está corriendo el servidor

async function testRedisCache() {
  console.log('🧪 Probando caché de Redis...\n');

  try {
    // 1. Probar productos (primera consulta - desde BD)
    console.log('1️⃣ Primera consulta de productos (desde BD):');
    const products1 = await fetch(`${BASE_URL}/api/catalog/products?page=1&limit=5`);
    const productsData1 = await products1.json();
    console.log('✅ Productos obtenidos:', productsData1.products?.length || 0, 'productos\n');

    // 2. Probar productos nuevamente (desde caché Redis)
    console.log('2️⃣ Segunda consulta de productos (desde caché Redis):');
    const products2 = await fetch(`${BASE_URL}/api/catalog/products?page=1&limit=5`);
    const productsData2 = await products2.json();
    console.log('✅ Productos obtenidos desde caché Redis:', productsData2.products?.length || 0, 'productos\n');

    // 3. Probar filtros (primera consulta - desde BD)
    console.log('3️⃣ Primera consulta de filtros (desde BD):');
    const filters1 = await fetch(`${BASE_URL}/api/catalog/filters`);
    const filtersData1 = await filters1.json();
    console.log('✅ Filtros obtenidos:', filtersData1.categories?.length || 0, 'categorías,', filtersData1.colors?.length || 0, 'colores\n');

    // 4. Probar filtros nuevamente (desde caché Redis)
    console.log('4️⃣ Segunda consulta de filtros (desde caché Redis):');
    const filters2 = await fetch(`${BASE_URL}/api/catalog/filters`);
    const filtersData2 = await filters2.json();
    console.log('✅ Filtros obtenidos desde caché Redis:', filtersData2.categories?.length || 0, 'categorías,', filtersData2.colors?.length || 0, 'colores\n');

    // 5. Probar hero images (primera consulta - desde BD)
    console.log('5️⃣ Primera consulta de hero images (desde BD):');
    const hero1 = await fetch(`${BASE_URL}/api/multimedia/hero`);
    const heroData1 = await hero1.json();
    console.log('✅ Hero images obtenidas:', heroData1.data?.length || 0, 'imágenes\n');

    // 6. Probar hero images nuevamente (desde caché Redis)
    console.log('6️⃣ Segunda consulta de hero images (desde caché Redis):');
    const hero2 = await fetch(`${BASE_URL}/api/multimedia/hero`);
    const heroData2 = await hero2.json();
    console.log('✅ Hero images obtenidas desde caché Redis:', heroData2.data?.length || 0, 'imágenes\n');

    // 7. Probar promo banners (primera consulta - desde BD)
    console.log('7️⃣ Primera consulta de promo banners (desde BD):');
    const promo1 = await fetch(`${BASE_URL}/api/multimedia/promo`);
    const promoData1 = await promo1.json();
    console.log('✅ Promo banners obtenidos:', promoData1.data?.length || 0, 'banners\n');

    // 8. Probar promo banners nuevamente (desde caché Redis)
    console.log('8️⃣ Segunda consulta de promo banners (desde caché Redis):');
    const promo2 = await fetch(`${BASE_URL}/api/multimedia/promo`);
    const promoData2 = await promo2.json();
    console.log('✅ Promo banners obtenidos desde caché Redis:', promoData2.data?.length || 0, 'banners\n');

    // 9. Verificar estadísticas del caché
    console.log('9️⃣ Estadísticas del caché Redis:');
    const cacheStats = await fetch(`${BASE_URL}/api/cache/invalidate`);
    const statsData = await cacheStats.json();
    console.log('✅ Estadísticas del caché:', statsData.stats);

    // 10. Probar invalidación de caché
    console.log('\n🔟 Probando invalidación de caché...');
    const invalidateResponse = await fetch(`${BASE_URL}/api/cache/invalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'products' })
    });
    const invalidateData = await invalidateResponse.json();
    console.log('✅ Invalidación de caché:', invalidateData.message);

    console.log('\n🎉 ¡Todas las pruebas de Redis completadas exitosamente!');

  } catch (error) {
    console.error('❌ Error en las pruebas de Redis:', error.message);
  }
}

// Ejecutar pruebas
testRedisCache();
