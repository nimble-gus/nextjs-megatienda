// Script para probar las categorías
const testCategories = async () => {
  try {
    console.log('=== Probando API de categorías ===');
    
    // Probar la API de categorías
    const response = await fetch('http://localhost:3000/api/categories');
    const data = await response.json();
    
    console.log('Categorías obtenidas:', data);
    
    if (data.success && data.categories.length > 0) {
      console.log('✅ API de categorías funciona correctamente');
      console.log('Categorías disponibles:');
      data.categories.forEach(cat => {
        console.log(`- ID: ${cat.id}, Nombre: ${cat.nombre}, Productos: ${cat.productos}`);
      });
      
      // Probar filtro por categoría
      const firstCategory = data.categories[0];
      console.log(`\n=== Probando filtro por categoría ${firstCategory.id} ===`);
      
      const productsResponse = await fetch(`http://localhost:3000/api/products?category=${firstCategory.id}`);
      const productsData = await productsResponse.json();
      
      console.log('Productos filtrados:', productsData);
      
      if (productsData.products) {
        console.log(`✅ Filtro por categoría funciona. Productos encontrados: ${productsData.products.length}`);
      } else {
        console.log('❌ Error en filtro por categoría');
      }
      
    } else {
      console.log('❌ Error obteniendo categorías');
    }
    
  } catch (error) {
    console.error('Error en prueba:', error);
  }
};

// Ejecutar prueba
testCategories();
