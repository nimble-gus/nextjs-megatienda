// Script de prueba para las APIs de admin (categorías y colores)
const testAdminAPIs = async () => {
  console.log('🔧 Probando APIs de admin...\n');

  try {
    // 1. Probar API de categorías
    console.log('1️⃣ Probando API de categorías...');
    
    const categoriesResponse = await fetch('http://localhost:3000/api/categories');
    
    if (!categoriesResponse.ok) {
      throw new Error(`Error en API categorías: ${categoriesResponse.status}`);
    }

    const categoriesData = await categoriesResponse.json();
    console.log('✅ Respuesta de categorías:', categoriesData);
    
    if (categoriesData.success && categoriesData.categories) {
      console.log(`   - Categorías encontradas: ${categoriesData.categories.length}`);
      categoriesData.categories.forEach(cat => {
        console.log(`     • ${cat.id}: ${cat.nombre} (${cat.productos} productos)`);
      });
    } else if (Array.isArray(categoriesData)) {
      console.log(`   - Categorías encontradas: ${categoriesData.length}`);
      categoriesData.forEach(cat => {
        console.log(`     • ${cat.id}: ${cat.nombre}`);
      });
    } else {
      console.log('❌ Formato inesperado de categorías');
    }

    // 2. Probar API de colores
    console.log('\n2️⃣ Probando API de colores...');
    
    const colorsResponse = await fetch('http://localhost:3000/api/colors');
    
    if (!colorsResponse.ok) {
      throw new Error(`Error en API colores: ${colorsResponse.status}`);
    }

    const colorsData = await colorsResponse.json();
    console.log('✅ Respuesta de colores:', colorsData);
    
    if (Array.isArray(colorsData)) {
      console.log(`   - Colores encontrados: ${colorsData.length}`);
      colorsData.forEach(color => {
        console.log(`     • ${color.id}: ${color.nombre} (${color.codigo_hex})`);
      });
    } else if (colorsData.success && colorsData.colors) {
      console.log(`   - Colores encontrados: ${colorsData.colors.length}`);
      colorsData.colors.forEach(color => {
        console.log(`     • ${color.id}: ${color.nombre} (${color.codigo_hex})`);
      });
    } else {
      console.log('❌ Formato inesperado de colores');
    }

    // 3. Probar servicios
    console.log('\n3️⃣ Probando servicios...');
    
    // Simular el servicio de categorías
    const testCategoriesService = async () => {
      const res = await fetch('http://localhost:3000/api/categories');
      if (!res.ok) throw new Error('Error obteniendo categorías');
      const data = await res.json();
      
      if (data.success && data.categories) {
        return data.categories;
      } else if (Array.isArray(data)) {
        return data;
      } else {
        console.error('Formato inesperado de categorías:', data);
        return [];
      }
    };

    // Simular el servicio de colores
    const testColorsService = async () => {
      const res = await fetch('http://localhost:3000/api/colors');
      if (!res.ok) throw new Error('Error obteniendo colores');
      const data = await res.json();
      
      if (Array.isArray(data)) {
        return data;
      } else if (data.success && data.colors) {
        return data.colors;
      } else {
        console.error('Formato inesperado de colores:', data);
        return [];
      }
    };

    const [testCategories, testColors] = await Promise.all([
      testCategoriesService(),
      testColorsService()
    ]);

    console.log('✅ Servicios funcionando:');
    console.log(`   - Categorías: ${testCategories.length} (array válido)`);
    console.log(`   - Colores: ${testColors.length} (array válido)`);

    console.log('\n🎉 ¡Prueba de APIs completada exitosamente!');
    console.log('📋 Resumen:');
    console.log(`   - API Categorías: ${categoriesData.success ? 'OK' : 'ERROR'}`);
    console.log(`   - API Colores: ${Array.isArray(colorsData) ? 'OK' : 'ERROR'}`);
    console.log(`   - Servicios: ${testCategories.length > 0 && testColors.length > 0 ? 'OK' : 'ERROR'}`);
    console.log(`   - ProductForm debería funcionar: ${testCategories.length > 0 && testColors.length > 0 ? 'SÍ' : 'NO'}`);

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    console.error('Stack:', error.stack);
  }
};

// Ejecutar la prueba
testAdminAPIs();
