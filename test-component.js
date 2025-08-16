// Script para probar el componente FeaturedProducts
const testComponent = async () => {
  try {
    console.log('=== Probando componente FeaturedProducts ===');
    
    // Simular la llamada que hace el componente
    const response = await fetch('http://localhost:3000/api/featured-products');
    const data = await response.json();
    
    console.log('Datos obtenidos por el componente:');
    console.log('- Success:', data.success);
    console.log('- Total productos:', data.total);
    console.log('- Productos con stock:', data.products.filter(p => p.hasStock).length);
    
    // Simular el estado del componente
    const featuredProducts = data.products;
    const loading = false;
    const error = null;
    
    console.log('\nEstado del componente:');
    console.log('- Loading:', loading);
    console.log('- Error:', error);
    console.log('- FeaturedProducts length:', featuredProducts.length);
    
    // Verificar si debería mostrar productos
    if (loading) {
      console.log('❌ Componente en estado de loading');
    } else if (error) {
      console.log('❌ Componente con error:', error);
    } else if (featuredProducts.length > 0) {
      console.log('✅ Componente debería mostrar productos');
      console.log('Productos disponibles:');
      featuredProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} - ${product.priceFormatted} (Stock: ${product.totalStock})`);
      });
    } else {
      console.log('❌ No hay productos para mostrar');
    }
    
  } catch (error) {
    console.error('Error probando componente:', error.message);
  }
};

// Ejecutar prueba
testComponent();
