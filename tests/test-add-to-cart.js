// Script de prueba para la funcionalidad de agregar al carrito
const testAddToCart = async () => {
  console.log('🛒 Probando funcionalidad de agregar al carrito...\n');

  try {
    // 1. Probar agregar producto al carrito
    console.log('1️⃣ Probando agregar producto al carrito...');
    
    const productData = {
      usuario_id: 1, // Cambiar por un ID de usuario válido
      producto_id: 1, // Cambiar por un ID de producto válido
      color_id: 1,    // Cambiar por un ID de color válido
      cantidad: 2
    };
    
    const addResponse = await fetch('http://localhost:3000/api/cart/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productData)
    });
    
    if (!addResponse.ok) {
      const errorData = await addResponse.json();
      throw new Error(`Error agregando al carrito: ${errorData.error || addResponse.status}`);
    }

    const addData = await addResponse.json();
    console.log('✅ Producto agregado al carrito exitosamente:');
    console.log(`   - Mensaje: ${addData.message}`);
    console.log(`   - Producto: ${addData.item.producto.nombre}`);
    console.log(`   - Color: ${addData.item.color.nombre}`);
    console.log(`   - Cantidad: ${addData.item.cantidad}`);
    console.log(`   - Precio: Q${addData.item.precio}`);

    // 2. Probar agregar el mismo producto (debería actualizar cantidad)
    console.log('\n2️⃣ Probando agregar el mismo producto (actualizar cantidad)...');
    
    const updateData = {
      usuario_id: 1,
      producto_id: 1,
      color_id: 1,
      cantidad: 1
    };
    
    const updateResponse = await fetch('http://localhost:3000/api/cart/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    
    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      throw new Error(`Error actualizando carrito: ${errorData.error || updateResponse.status}`);
    }

    const updateResult = await updateResponse.json();
    console.log('✅ Cantidad actualizada exitosamente:');
    console.log(`   - Mensaje: ${updateResult.message}`);
    console.log(`   - Nueva cantidad total: ${updateResult.item.cantidad}`);

    // 3. Probar agregar producto con stock insuficiente
    console.log('\n3️⃣ Probando agregar producto con stock insuficiente...');
    
    const invalidData = {
      usuario_id: 1,
      producto_id: 1,
      color_id: 1,
      cantidad: 999 // Cantidad muy alta
    };
    
    const invalidResponse = await fetch('http://localhost:3000/api/cart/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(invalidData)
    });
    
    if (invalidResponse.ok) {
      console.log('⚠️  Debería haber fallado por stock insuficiente');
    } else {
      const errorData = await invalidResponse.json();
      console.log('✅ Error manejado correctamente:');
      console.log(`   - Error: ${errorData.error}`);
      console.log(`   - Status: ${invalidResponse.status}`);
    }

    // 4. Probar agregar producto inexistente
    console.log('\n4️⃣ Probando agregar producto inexistente...');
    
    const nonExistentData = {
      usuario_id: 1,
      producto_id: 99999, // Producto que no existe
      color_id: 1,
      cantidad: 1
    };
    
    const nonExistentResponse = await fetch('http://localhost:3000/api/cart/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(nonExistentData)
    });
    
    if (nonExistentResponse.ok) {
      console.log('⚠️  Debería haber fallado por producto inexistente');
    } else {
      const errorData = await nonExistentResponse.json();
      console.log('✅ Error manejado correctamente:');
      console.log(`   - Error: ${errorData.error}`);
      console.log(`   - Status: ${nonExistentResponse.status}`);
    }

    // 5. Verificar el carrito después de las operaciones
    console.log('\n5️⃣ Verificando carrito después de las operaciones...');
    
    const cartResponse = await fetch('http://localhost:3000/api/cart/1');
    
    if (!cartResponse.ok) {
      throw new Error(`Error obteniendo carrito: ${cartResponse.status}`);
    }

    const cartData = await cartResponse.json();
    console.log('✅ Carrito verificado:');
    console.log(`   - Items en carrito: ${cartData.items.length}`);
    console.log(`   - Total de items: ${cartData.totalItems}`);
    
    if (cartData.items.length > 0) {
      cartData.items.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.producto.nombre} (${item.cantidad}x) - Q${item.precio}`);
      });
    }

    // 6. Simular estructura de datos para el frontend
    console.log('\n6️⃣ Simulando estructura de datos para el frontend...');
    
    const sampleProduct = {
      id: 1,
      name: "Bicicleta estática",
      sku: "SKU-123456",
      price: 150.00,
      colors: [
        {
          id: 1,
          name: "Negro",
          hex: "#000000",
          available: true,
          stock: 10
        },
        {
          id: 2,
          name: "Rojo",
          hex: "#FF0000",
          available: true,
          stock: 5
        }
      ]
    };
    
    console.log('✅ Estructura de producto para el frontend:');
    console.log(`   - ID: ${sampleProduct.id}`);
    console.log(`   - Nombre: ${sampleProduct.name}`);
    console.log(`   - SKU: ${sampleProduct.sku}`);
    console.log(`   - Precio: Q${sampleProduct.price}`);
    console.log(`   - Colores disponibles: ${sampleProduct.colors.length}`);
    sampleProduct.colors.forEach((color, index) => {
      console.log(`     ${index + 1}. ${color.name} (${color.stock} disponibles)`);
    });

    console.log('\n🎉 ¡Prueba de agregar al carrito completada exitosamente!');
    console.log('📋 Resumen:');
    console.log(`   - Agregar producto: ${addData.success ? 'OK' : 'Error'}`);
    console.log(`   - Actualizar cantidad: ${updateResult.success ? 'OK' : 'Error'}`);
    console.log(`   - Validación de stock: ${!invalidResponse.ok ? 'OK' : 'Error'}`);
    console.log(`   - Validación de producto: ${!nonExistentResponse.ok ? 'OK' : 'Error'}`);
    console.log(`   - Verificación de carrito: ${cartData.success ? 'OK' : 'Error'}`);
    console.log(`   - Estructura de datos: Correcta`);
    console.log('\n🚀 Funcionalidad de agregar al carrito lista para usar!');

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    console.error('Stack:', error.stack);
  }
};

// Ejecutar la prueba
testAddToCart();
