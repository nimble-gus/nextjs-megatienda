// Script de prueba para la API de productos con stock bajo
const testLowStockAPI = async () => {
  try {
    console.log('🧪 Probando API de productos con stock bajo...');
    
    const response = await fetch('http://localhost:3000/api/admin/products/low-stock');
    const data = await response.json();
    
    console.log('📊 Respuesta de la API:', data);
    
    if (data.success) {
      console.log(`✅ Encontrados ${data.total} productos con stock bajo`);
      
      if (data.products.length > 0) {
        console.log('📦 Productos con stock bajo:');
        data.products.forEach(product => {
          console.log(`  - ${product.nombre} (${product.categoria}): ${product.totalStock} unidades`);
          if (product.stockDetails.length > 0) {
            console.log(`    Colores: ${product.stockDetails.map(s => `${s.color.nombre}: ${s.cantidad}`).join(', ')}`);
          }
        });
      } else {
        console.log('✅ No hay productos con stock bajo');
      }
    } else {
      console.error('❌ Error en la API:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Error al probar la API:', error);
  }
};

// Ejecutar la prueba
testLowStockAPI();
