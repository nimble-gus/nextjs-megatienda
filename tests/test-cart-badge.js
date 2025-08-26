// Script de prueba para verificar el badge del carrito
const testCartBadge = async () => {
  console.log('🛒 Probando funcionalidad del badge del carrito...\n');

  try {
    const userId = 1; // Cambiar por un ID de usuario válido

    // 1. Verificar estado inicial del carrito
    console.log('1️⃣ Verificando estado inicial del carrito...');
    
    const initialCartResponse = await fetch(`http://localhost:3000/api/cart/${userId}`);
    const initialCartData = await initialCartResponse.json();
    
    console.log('✅ Estado inicial:');
    console.log(`   - Items en carrito: ${initialCartData.items?.length || 0}`);
    console.log(`   - Total items: ${initialCartData.totalItems || 0}`);

    // 2. Agregar un producto al carrito
    console.log('\n2️⃣ Agregando producto al carrito...');
    
    const addData = {
      usuario_id: userId,
      producto_id: 1, // Cambiar por un ID de producto válido
      color_id: 1,    // Cambiar por un ID de color válido
      cantidad: 2
    };
    
    const addResponse = await fetch('http://localhost:3000/api/cart/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(addData)
    });
    
    if (addResponse.ok) {
      const addResult = await addResponse.json();
      console.log('✅ Producto agregado:');
      console.log(`   - Mensaje: ${addResult.message}`);
      console.log(`   - Cantidad: ${addResult.item?.cantidad}`);
    } else {
      const errorData = await addResponse.json();
      console.log('❌ Error agregando producto:');
      console.log(`   - Error: ${errorData.error}`);
      console.log('   - Nota: Esto puede ser normal si el producto/color no existe');
    }

    // 3. Verificar carrito después de agregar
    console.log('\n3️⃣ Verificando carrito después de agregar producto...');
    
    const updatedCartResponse = await fetch(`http://localhost:3000/api/cart/${userId}`);
    const updatedCartData = await updatedCartResponse.json();
    
    console.log('✅ Estado actualizado:');
    console.log(`   - Items en carrito: ${updatedCartData.items?.length || 0}`);
    console.log(`   - Total items: ${updatedCartData.totalItems || 0}`);
    
    if (updatedCartData.items && updatedCartData.items.length > 0) {
      console.log('   - Detalles de items:');
      updatedCartData.items.forEach((item, index) => {
        console.log(`     ${index + 1}. ${item.producto.nombre} - ${item.cantidad}x - Q${item.precio}`);
      });
    }

    // 4. Simular actualización del badge
    console.log('\n4️⃣ Simulando actualización del badge...');
    
    const totalItems = updatedCartData.items?.reduce((total, item) => total + (item.cantidad || 0), 0) || 0;
    console.log('✅ Badge debería mostrar:');
    console.log(`   - Número: ${totalItems}`);
    console.log(`   - Visible: ${totalItems > 0 ? 'SÍ' : 'NO'}`);

    // 5. Verificar estructura de datos para el frontend
    console.log('\n5️⃣ Verificando estructura de datos para el frontend...');
    
    const frontendData = {
      cartCount: totalItems,
      shouldShowBadge: totalItems > 0,
      badgeText: totalItems > 99 ? '99+' : totalItems.toString()
    };
    
    console.log('✅ Datos para el frontend:');
    console.log(`   - cartCount: ${frontendData.cartCount}`);
    console.log(`   - shouldShowBadge: ${frontendData.shouldShowBadge}`);
    console.log(`   - badgeText: "${frontendData.badgeText}"`);

    // 6. Limpiar carrito para pruebas futuras
    console.log('\n6️⃣ Limpiando carrito...');
    
    const clearResponse = await fetch(`http://localhost:3000/api/cart/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (clearResponse.ok) {
      console.log('✅ Carrito limpiado exitosamente');
    } else {
      console.log('❌ Error limpiando carrito');
    }

    console.log('\n🎉 ¡Prueba del badge del carrito completada!');
    console.log('📋 Resumen:');
    console.log(`   - Estado inicial: ${initialCartData.totalItems || 0} items`);
    console.log(`   - Después de agregar: ${totalItems} items`);
    console.log(`   - Badge visible: ${totalItems > 0 ? 'SÍ' : 'NO'}`);
    console.log('\n💡 Para probar en el navegador:');
    console.log('   1. Inicia sesión en la aplicación');
    console.log('   2. Agrega productos al carrito');
    console.log('   3. Verifica que el badge aparezca en el header');
    console.log('   4. El badge debería mostrar el número total de items');

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    console.error('Stack:', error.stack);
  }
};

// Ejecutar la prueba
testCartBadge();
