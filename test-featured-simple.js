// Script simple para probar productos destacados
const testFeaturedSimple = async () => {
  try {
    console.log('=== Probando API /api/featured-products (versión simplificada) ===');
    
    const response = await fetch('http://localhost:3000/api/featured-products');
    const data = await response.json();
    
    console.log('Respuesta completa:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ API funciona correctamente');
      console.log(`Productos destacados: ${data.products.length}`);
      
      data.products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} - ${product.priceFormatted} (Stock: ${product.totalStock})`);
      });
    } else {
      console.log('❌ Error en API:', data.error);
      console.log('Detalles:', data.details);
    }
    
  } catch (error) {
    console.error('Error en prueba:', error.message);
  }
};

// Ejecutar prueba
testFeaturedSimple();
