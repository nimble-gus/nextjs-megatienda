// Script de prueba para todas las APIs del carrito
const testCartAPIs = async () => {
  console.log('🛒 Probando todas las APIs del carrito...\n');

  try {
    // 1. Probar obtener carrito de usuario
    console.log('1️⃣ Probando GET /api/cart/[userId]...');
    
    const userId = 1; // Cambiar por un ID de usuario válido
    const cartResponse = await fetch(`http://localhost:3000/api/cart/${userId}`);
    
    console.log('✅ Respuesta del carrito:');
    console.log(`   - Status: ${cartResponse.status}`);
    
    if (cartResponse.ok) {
      const cartData = await cartResponse.json();
      console.log(`   - Success: ${cartData.success}`);
      console.log(`   - Items: ${cartData.items?.length || 0}`);
      console.log(`   - Total Items: ${cartData.totalItems || 0}`);
    } else {
      const errorData = await cartResponse.json().catch(() => ({}));
      console.log(`   - Error: ${errorData.error || 'Error desconocido'}`);
    }

    // 2. Probar agregar al carrito
    console.log('\n2️⃣ Probando POST /api/cart/add...');
    
    const addData = {
      usuario_id: 1,
      producto_id: 1,
      color_id: 1,
      cantidad: 1
    };
    
    const addResponse = await fetch('http://localhost:3000/api/cart/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(addData)
    });
    
    console.log('✅ Respuesta de agregar al carrito:');
    console.log(`   - Status: ${addResponse.status}`);
    
    if (addResponse.ok) {
      const addResult = await addResponse.json();
      console.log(`   - Success: ${addResult.success}`);
      console.log(`   - Message: ${addResult.message}`);
    } else {
      const errorData = await addResponse.json().catch(() => ({}));
      console.log(`   - Error: ${errorData.error || 'Error desconocido'}`);
    }

    // 3. Probar actualizar item del carrito (si existe)
    console.log('\n3️⃣ Probando PATCH /api/cart/items/[itemId]...');
    
    // Primero obtener el carrito para ver si hay items
    const cartCheckResponse = await fetch(`http://localhost:3000/api/cart/${userId}`);
    if (cartCheckResponse.ok) {
      const cartCheckData = await cartCheckResponse.json();
      if (cartCheckData.items && cartCheckData.items.length > 0) {
        const itemId = cartCheckData.items[0].id;
        
        const updateResponse = await fetch(`http://localhost:3000/api/cart/items/${itemId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ cantidad: 2 })
        });
        
        console.log('✅ Respuesta de actualizar item:');
        console.log(`   - Status: ${updateResponse.status}`);
        
        if (updateResponse.ok) {
          const updateResult = await updateResponse.json();
          console.log(`   - Success: ${updateResult.success}`);
          console.log(`   - Nueva cantidad: ${updateResult.item?.cantidad}`);
        } else {
          const errorData = await updateResponse.json().catch(() => ({}));
          console.log(`   - Error: ${errorData.error || 'Error desconocido'}`);
        }
      } else {
        console.log('   - No hay items en el carrito para actualizar');
      }
    }

    // 4. Probar eliminar item del carrito (si existe)
    console.log('\n4️⃣ Probando DELETE /api/cart/items/[itemId]...');
    
    const cartDeleteCheckResponse = await fetch(`http://localhost:3000/api/cart/${userId}`);
    if (cartDeleteCheckResponse.ok) {
      const cartDeleteCheckData = await cartDeleteCheckResponse.json();
      if (cartDeleteCheckData.items && cartDeleteCheckData.items.length > 0) {
        const itemId = cartDeleteCheckData.items[0].id;
        
        const deleteResponse = await fetch(`http://localhost:3000/api/cart/items/${itemId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        console.log('✅ Respuesta de eliminar item:');
        console.log(`   - Status: ${deleteResponse.status}`);
        
        if (deleteResponse.ok) {
          const deleteResult = await deleteResponse.json();
          console.log(`   - Success: ${deleteResult.success}`);
          console.log(`   - Message: ${deleteResult.message}`);
        } else {
          const errorData = await deleteResponse.json().catch(() => ({}));
          console.log(`   - Error: ${errorData.error || 'Error desconocido'}`);
        }
      } else {
        console.log('   - No hay items en el carrito para eliminar');
      }
    }

    // 5. Probar limpiar carrito
    console.log('\n5️⃣ Probando DELETE /api/cart/[userId]...');
    
    const clearResponse = await fetch(`http://localhost:3000/api/cart/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Respuesta de limpiar carrito:');
    console.log(`   - Status: ${clearResponse.status}`);
    
    if (clearResponse.ok) {
      const clearResult = await clearResponse.json();
      console.log(`   - Success: ${clearResult.success}`);
      console.log(`   - Message: ${clearResult.message}`);
    } else {
      const errorData = await clearResponse.json().catch(() => ({}));
      console.log(`   - Error: ${errorData.error || 'Error desconocido'}`);
    }

    console.log('\n🎉 ¡Prueba de APIs del carrito completada!');
    console.log('📋 Resumen:');
    console.log(`   - GET /api/cart/[userId]: ${cartResponse.status === 200 ? 'OK' : 'Error'}`);
    console.log(`   - POST /api/cart/add: ${addResponse.status === 200 ? 'OK' : 'Error'}`);
    console.log(`   - PATCH /api/cart/items/[itemId]: ${cartCheckResponse.ok ? 'OK' : 'Error'}`);
    console.log(`   - DELETE /api/cart/items/[itemId]: ${cartDeleteCheckResponse.ok ? 'OK' : 'Error'}`);
    console.log(`   - DELETE /api/cart/[userId]: ${clearResponse.status === 200 ? 'OK' : 'Error'}`);
    console.log('\n🚀 APIs del carrito listas para usar!');

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    console.error('Stack:', error.stack);
  }
};

// Ejecutar la prueba
testCartAPIs();
