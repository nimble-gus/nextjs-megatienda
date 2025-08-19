// Script para probar la eliminación de productos
const fetch = require('node-fetch');

async function testDeleteProduct() {
  console.log('🧪 Probando eliminación de productos...');
  
  try {
    // Primero obtener la lista de productos
    console.log('📋 Obteniendo lista de productos...');
    const productsResponse = await fetch('http://localhost:3000/api/admin/products');
    const products = await productsResponse.json();
    
    if (!products.success || products.products.length === 0) {
      console.log('❌ No hay productos para eliminar');
      return;
    }
    
    const firstProduct = products.products[0];
    console.log(`🎯 Producto a eliminar: ${firstProduct.nombre} (ID: ${firstProduct.id})`);
    
    // Intentar eliminar el producto
    console.log('🗑️ Eliminando producto...');
    const deleteResponse = await fetch(`http://localhost:3000/api/admin/products/${firstProduct.id}`, {
      method: 'DELETE'
    });
    
    const deleteResult = await deleteResponse.json();
    
    if (deleteResponse.ok) {
      console.log('✅ Producto eliminado exitosamente');
      console.log('📊 Resultado:', deleteResult);
    } else {
      console.log('❌ Error eliminando producto');
      console.log('📊 Error:', deleteResult);
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

// Ejecutar la prueba
testDeleteProduct();
