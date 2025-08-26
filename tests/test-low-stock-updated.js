// Script de prueba para la API de productos con stock bajo (actualizada)
const testLowStockAPI = async () => {
  try {
    console.log('🧪 Probando API de productos con stock bajo (actualizada)...');
    
    const response = await fetch('http://localhost:3000/api/admin/products/low-stock');
    const data = await response.json();
    
    console.log('📊 Respuesta de la API:', data);
    
    if (data.success) {
      console.log(`✅ Encontrados ${data.total} productos con stock bajo o agotado`);
      
      if (data.products.length > 0) {
        console.log('📦 Productos con stock bajo o agotado:');
        data.products.forEach(product => {
          const status = product.totalStock === 0 ? 'AGOTADO' : 'STOCK BAJO';
          console.log(`  - ${product.nombre} (${product.categoria}): ${product.totalStock} unidades [${status}]`);
          if (product.stockDetails.length > 0) {
            console.log(`    Colores: ${product.stockDetails.map(s => `${s.color.nombre}: ${s.cantidad}`).join(', ')}`);
          }
        });
        
        // Contar productos agotados vs stock bajo
        const agotados = data.products.filter(p => p.totalStock === 0).length;
        const stockBajo = data.products.filter(p => p.totalStock > 0 && p.totalStock < 10).length;
        
        console.log(`\n📈 Resumen:`);
        console.log(`  - Productos agotados: ${agotados}`);
        console.log(`  - Productos con stock bajo: ${stockBajo}`);
        console.log(`  - Total de alertas: ${data.total}`);
      } else {
        console.log('✅ No hay productos con stock bajo o agotado');
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
