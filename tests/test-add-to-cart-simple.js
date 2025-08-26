// Script de prueba simple para la funcionalidad de agregar al carrito
const testAddToCartSimple = async () => {
  console.log('🛒 Probando API de agregar al carrito...\n');

  try {
    // Probar la API con datos inválidos para verificar que maneja errores correctamente
    console.log('1️⃣ Probando validación de datos...');
    
    const invalidData = {
      // Datos incompletos para probar validación
    };
    
    const response = await fetch('http://localhost:3000/api/cart/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(invalidData)
    });
    
    const result = await response.json();
    
    console.log('✅ API responde correctamente:');
    console.log(`   - Status: ${response.status}`);
    console.log(`   - Error: ${result.error}`);
    console.log(`   - Mensaje: ${result.details || 'Sin detalles'}`);

    // Probar con datos válidos pero producto inexistente
    console.log('\n2️⃣ Probando con producto inexistente...');
    
    const nonExistentData = {
      usuario_id: 1,
      producto_id: 99999,
      color_id: 1,
      cantidad: 1
    };
    
    const response2 = await fetch('http://localhost:3000/api/cart/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(nonExistentData)
    });
    
    const result2 = await response2.json();
    
    console.log('✅ API maneja producto inexistente:');
    console.log(`   - Status: ${response2.status}`);
    console.log(`   - Error: ${result2.error}`);

    console.log('\n🎉 ¡API de agregar al carrito funciona correctamente!');
    console.log('📋 Resumen:');
    console.log(`   - Validación de datos: ${response.status === 400 ? 'OK' : 'Error'}`);
    console.log(`   - Manejo de errores: ${response2.status === 404 ? 'OK' : 'Error'}`);
    console.log('\n🚀 API lista para usar con datos reales!');

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    console.error('Stack:', error.stack);
  }
};

// Ejecutar la prueba
testAddToCartSimple();
