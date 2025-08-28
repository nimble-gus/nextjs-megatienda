// Script de prueba para verificar el estado del carrito
console.log('🧪 Script de prueba para verificar el estado del carrito');

// Función para verificar el estado actual del carrito
function checkCartState() {
  console.log('\n📊 Estado actual del carrito:');
  
  const cart = localStorage.getItem('cart');
  const cartItems = localStorage.getItem('cartItems');
  const guestCart = localStorage.getItem('guestCart');
  const cartCount = localStorage.getItem('cartCount');
  
  console.log('🛒 cart:', cart ? 'Presente' : 'No encontrado');
  console.log('📦 cartItems:', cartItems ? 'Presente' : 'No encontrado');
  console.log('👤 guestCart:', guestCart ? 'Presente' : 'No encontrado');
  console.log('🔢 cartCount:', cartCount || 'No encontrado');
  
  if (cart) {
    try {
      const cartData = JSON.parse(cart);
      console.log('📋 Contenido del carrito:', cartData);
    } catch (e) {
      console.log('❌ Error parseando carrito:', e.message);
    }
  }
  
  if (cartItems) {
    try {
      const itemsData = JSON.parse(cartItems);
      console.log('📦 Contenido de cartItems:', itemsData);
    } catch (e) {
      console.log('❌ Error parseando cartItems:', e.message);
    }
  }
}

// Función para simular la limpieza del carrito
function simulateCartClear() {
  console.log('\n🧹 Simulando limpieza del carrito...');
  
  try {
    // Limpiar localStorage
    localStorage.removeItem('cart');
    localStorage.removeItem('cartItems');
    localStorage.removeItem('guestCart');
    localStorage.removeItem('cartCount');
    
    // Disparar eventos
    window.dispatchEvent(new CustomEvent('cartUpdated', {
      detail: { cartCount: 0 }
    }));
    
    window.dispatchEvent(new CustomEvent('cartCleared'));
    
    window.dispatchEvent(new CustomEvent('cartStateChanged', {
      detail: { action: 'cleared', cartCount: 0 }
    }));
    
    console.log('✅ Limpieza simulada completada');
    
    // Verificar estado después de la limpieza
    setTimeout(() => {
      console.log('\n🔍 Verificación post-limpieza:');
      checkCartState();
    }, 100);
    
  } catch (error) {
    console.error('❌ Error en limpieza simulada:', error);
  }
}

// Función para agregar un producto de prueba al carrito
function addTestProduct() {
  console.log('\n➕ Agregando producto de prueba al carrito...');
  
  const testProduct = {
    id: 'test-123',
    nombre: 'Producto de Prueba',
    precio: 100,
    cantidad: 1,
    color: { id: 1, nombre: 'Rojo' }
  };
  
  try {
    localStorage.setItem('cart', JSON.stringify([testProduct]));
    localStorage.setItem('cartItems', JSON.stringify([testProduct]));
    localStorage.setItem('cartCount', '1');
    
    console.log('✅ Producto de prueba agregado');
    
    // Verificar estado después de agregar
    setTimeout(() => {
      console.log('\n🔍 Verificación post-agregado:');
      checkCartState();
    }, 100);
    
  } catch (error) {
    console.error('❌ Error agregando producto de prueba:', error);
  }
}

// Ejecutar verificación inicial
console.log('🚀 Iniciando verificación del carrito...');
checkCartState();

// Exportar funciones para uso en consola del navegador
window.testCart = {
  checkState: checkCartState,
  clear: simulateCartClear,
  addTest: addTestProduct
};

console.log('\n📝 Funciones disponibles en la consola:');
console.log('window.testCart.checkState() - Verificar estado del carrito');
console.log('window.testCart.clear() - Simular limpieza del carrito');
console.log('window.testCart.addTest() - Agregar producto de prueba');

console.log('\n✅ Script de prueba cargado. Usa las funciones en la consola del navegador.');
