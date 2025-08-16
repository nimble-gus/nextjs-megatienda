// Script para probar el rango de precio
const testPriceRange = async () => {
  try {
    console.log('=== Probando rango de precio ===');
    
    // Probar la API de filtros del catálogo
    const response = await fetch('http://localhost:3000/api/catalog/filters');
    const data = await response.json();
    
    console.log('Filtros obtenidos:', data);
    
    if (data.priceRange) {
      console.log('✅ Rango de precio obtenido correctamente');
      console.log(`Precio mínimo: Q${data.priceRange.min}`);
      console.log(`Precio máximo: Q${data.priceRange.max}`);
      
      // Probar productos sin filtro de precio
      console.log('\n=== Probando productos sin filtro de precio ===');
      const productsResponse = await fetch('http://localhost:3000/api/products');
      const productsData = await productsResponse.json();
      
      if (productsData.products) {
        console.log(`✅ Productos obtenidos: ${productsData.products.length}`);
        
        // Verificar que los productos estén dentro del rango
        const prices = productsData.products.map(p => p.price).filter(p => p > 0);
        if (prices.length > 0) {
          const minPrice = Math.min(...prices);
          const maxPrice = Math.max(...prices);
          console.log(`Precio mínimo en productos: Q${minPrice}`);
          console.log(`Precio máximo en productos: Q${maxPrice}`);
        }
      }
      
      // Probar productos con filtro de precio completo
      console.log('\n=== Probando productos con filtro de precio completo ===');
      const filteredResponse = await fetch(`http://localhost:3000/api/products?minPrice=${data.priceRange.min}&maxPrice=${data.priceRange.max}`);
      const filteredData = await filteredResponse.json();
      
      if (filteredData.products) {
        console.log(`✅ Productos con filtro de precio: ${filteredData.products.length}`);
      }
      
    } else {
      console.log('❌ Error obteniendo rango de precio');
    }
    
  } catch (error) {
    console.error('Error en prueba:', error);
  }
};

// Ejecutar prueba
testPriceRange();
