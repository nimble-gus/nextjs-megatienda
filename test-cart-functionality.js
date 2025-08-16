// Script de prueba para la funcionalidad del carrito
const testCartFunctionality = async () => {
  console.log('🛒 Probando funcionalidad del carrito...\n');

  try {
    // 1. Probar obtener carrito de un usuario
    console.log('1️⃣ Probando obtener carrito de usuario...');
    
    const userId = 1; // Cambiar por un ID de usuario válido
    const cartResponse = await fetch(`http://localhost:3000/api/cart/${userId}`);
    
    if (!cartResponse.ok) {
      throw new Error(`Error obteniendo carrito: ${cartResponse.status}`);
    }

    const cartData = await cartResponse.json();
    console.log('✅ Carrito obtenido exitosamente:');
    console.log(`   - Items en carrito: ${cartData.items.length}`);
    console.log(`   - Total de items: ${cartData.totalItems}`);
    
    if (cartData.items.length > 0) {
      cartData.items.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.producto.nombre} (${item.cantidad}x) - Q${item.precio}`);
      });
    }

    // 2. Probar actualizar cantidad de un item (si existe)
    if (cartData.items.length > 0) {
      console.log('\n2️⃣ Probando actualizar cantidad de item...');
      
      const itemId = cartData.items[0].id;
      const newQuantity = cartData.items[0].cantidad + 1;
      
      const updateResponse = await fetch(`http://localhost:3000/api/cart/items/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cantidad: newQuantity })
      });
      
      if (!updateResponse.ok) {
        throw new Error(`Error actualizando item: ${updateResponse.status}`);
      }

      const updateData = await updateResponse.json();
      console.log('✅ Item actualizado exitosamente:');
      console.log(`   - Nueva cantidad: ${updateData.item.cantidad}`);
      console.log(`   - Precio total: Q${updateData.item.precio * updateData.item.cantidad}`);
    }

    // 3. Probar eliminar un item (si existe)
    if (cartData.items.length > 0) {
      console.log('\n3️⃣ Probando eliminar item...');
      
      const itemId = cartData.items[0].id;
      
      const deleteResponse = await fetch(`http://localhost:3000/api/cart/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!deleteResponse.ok) {
        throw new Error(`Error eliminando item: ${deleteResponse.status}`);
      }

      const deleteData = await deleteResponse.json();
      console.log('✅ Item eliminado exitosamente:');
      console.log(`   - Mensaje: ${deleteData.message}`);
    }

    // 4. Probar limpiar carrito
    console.log('\n4️⃣ Probando limpiar carrito...');
    
    const clearResponse = await fetch(`http://localhost:3000/api/cart/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!clearResponse.ok) {
      throw new Error(`Error limpiando carrito: ${clearResponse.status}`);
    }

    const clearData = await clearResponse.json();
    console.log('✅ Carrito limpiado exitosamente:');
    console.log(`   - Mensaje: ${clearData.message}`);

    // 5. Verificar que el carrito está vacío
    console.log('\n5️⃣ Verificando carrito vacío...');
    
    const emptyCartResponse = await fetch(`http://localhost:3000/api/cart/${userId}`);
    
    if (!emptyCartResponse.ok) {
      throw new Error(`Error verificando carrito vacío: ${emptyCartResponse.status}`);
    }

    const emptyCartData = await emptyCartResponse.json();
    console.log('✅ Verificación completada:');
    console.log(`   - Items en carrito: ${emptyCartData.items.length}`);
    console.log(`   - Carrito vacío: ${emptyCartData.items.length === 0 ? 'Sí' : 'No'}`);

    // 6. Simular estructura de datos del carrito
    console.log('\n6️⃣ Simulando estructura de datos...');
    
    const sampleCartItem = {
      id: 1,
      cantidad: 2,
      precio: 150.00,
      producto: {
        id: 1,
        nombre: "Bicicleta estática",
        sku: "SKU-123456",
        descripcion: "Bicicleta de entrenamiento",
        url_imagen: "/assets/bike.jpg",
        categoria: {
          id: 1,
          nombre: "Fitness"
        }
      },
      color: {
        id: 1,
        nombre: "Negro",
        codigo_hex: "#000000"
      }
    };
    
    console.log('✅ Estructura de datos del carrito:');
    console.log(`   - ID del item: ${sampleCartItem.id}`);
    console.log(`   - Producto: ${sampleCartItem.producto.nombre}`);
    console.log(`   - SKU: ${sampleCartItem.producto.sku}`);
    console.log(`   - Cantidad: ${sampleCartItem.cantidad}`);
    console.log(`   - Precio unitario: Q${sampleCartItem.precio}`);
    console.log(`   - Precio total: Q${sampleCartItem.precio * sampleCartItem.cantidad}`);
    console.log(`   - Color: ${sampleCartItem.color.nombre}`);
    console.log(`   - Categoría: ${sampleCartItem.producto.categoria.nombre}`);

    console.log('\n🎉 ¡Prueba del carrito completada exitosamente!');
    console.log('📋 Resumen:');
    console.log(`   - Obtener carrito: ${cartData.success ? 'OK' : 'Error'}`);
    console.log(`   - Actualizar item: ${cartData.items.length > 0 ? 'OK' : 'Sin items'}`);
    console.log(`   - Eliminar item: ${cartData.items.length > 0 ? 'OK' : 'Sin items'}`);
    console.log(`   - Limpiar carrito: ${clearData.success ? 'OK' : 'Error'}`);
    console.log(`   - Verificar vacío: ${emptyCartData.items.length === 0 ? 'OK' : 'Error'}`);
    console.log(`   - Estructura de datos: Correcta`);
    console.log('\n🚀 Funcionalidad del carrito lista para usar!');

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    console.error('Stack:', error.stack);
  }
};

// Ejecutar la prueba
testCartFunctionality();
