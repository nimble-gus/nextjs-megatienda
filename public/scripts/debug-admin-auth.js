// Script para diagnosticar el estado de autenticación de admin
console.log('🔍 Script de diagnóstico de autenticación de admin');

// Función para verificar cookies
function checkCookies() {
  console.log('🍪 Verificando cookies...');
  
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {});
  
  console.log('Cookies encontradas:', cookies);
  
  const adminCookies = {
    adminAccessToken: cookies.adminAccessToken ? '✅ Presente' : '❌ Ausente',
    adminRefreshToken: cookies.adminRefreshToken ? '✅ Presente' : '❌ Ausente',
    accessToken: cookies.accessToken ? '✅ Presente (usuario normal)' : '❌ Ausente',
    refreshToken: cookies.refreshToken ? '✅ Presente (usuario normal)' : '❌ Ausente'
  };
  
  console.log('Estado de cookies de admin:', adminCookies);
  return adminCookies;
}

// Función para verificar localStorage
function checkLocalStorage() {
  console.log('💾 Verificando localStorage...');
  
  const adminUser = localStorage.getItem('adminUser');
  const user = localStorage.getItem('user');
  
  console.log('localStorage adminUser:', adminUser ? '✅ Presente' : '❌ Ausente');
  console.log('localStorage user:', user ? '✅ Presente (usuario normal)' : '❌ Ausente');
  
  if (adminUser) {
    try {
      const parsed = JSON.parse(adminUser);
      console.log('Datos de adminUser:', parsed);
    } catch (e) {
      console.log('Error parseando adminUser:', e);
    }
  }
  
  return { adminUser, user };
}

// Función para verificar estado de autenticación
async function checkAuthStatus() {
  console.log('🔐 Verificando estado de autenticación...');
  
  try {
    const response = await fetch('/api/auth/admin/status', {
      credentials: 'include'
    });
    
    const data = await response.json();
    console.log('Respuesta de /api/auth/admin/status:', data);
    
    return data;
  } catch (error) {
    console.error('Error verificando estado de auth:', error);
    return null;
  }
}

// Función para verificar endpoint de órdenes pendientes
async function checkPendingOrders() {
  console.log('📊 Verificando endpoint de órdenes pendientes...');
  
  try {
    const response = await fetch('/api/admin/orders/pending-count', {
      credentials: 'include'
    });
    
    console.log('Status de respuesta:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Respuesta exitosa:', data);
    } else {
      const errorData = await response.json();
      console.log('Error en respuesta:', errorData);
    }
    
    return response.status;
  } catch (error) {
    console.error('Error verificando órdenes pendientes:', error);
    return null;
  }
}

// Función para limpiar todo y hacer logout
async function clearAllAuth() {
  console.log('🧹 Limpiando toda la autenticación...');
  
  // Limpiar cookies
  document.cookie = 'adminAccessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'adminRefreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  
  // Limpiar localStorage
  localStorage.removeItem('adminUser');
  localStorage.removeItem('user');
  localStorage.removeItem('cart');
  localStorage.removeItem('cartItems');
  
  console.log('✅ Autenticación limpiada');
}

// Función principal de diagnóstico
async function runDiagnostic() {
  console.log('🚀 Iniciando diagnóstico completo...');
  
  console.log('\n=== PASO 1: Verificar cookies ===');
  const cookies = checkCookies();
  
  console.log('\n=== PASO 2: Verificar localStorage ===');
  const storage = checkLocalStorage();
  
  console.log('\n=== PASO 3: Verificar estado de auth ===');
  const authStatus = await checkAuthStatus();
  
  console.log('\n=== PASO 4: Verificar endpoint de órdenes ===');
  const ordersStatus = await checkPendingOrders();
  
  console.log('\n=== RESUMEN ===');
  console.log('Cookies de admin:', cookies.adminAccessToken, cookies.adminRefreshToken);
  console.log('localStorage adminUser:', storage.adminUser ? '✅' : '❌');
  console.log('Auth status:', authStatus?.isAuthenticated ? '✅ Autenticado' : '❌ No autenticado');
  console.log('Orders endpoint:', ordersStatus === 200 ? '✅ Funciona' : `❌ Error ${ordersStatus}`);
  
  if (ordersStatus === 401) {
    console.log('\n🔧 SOLUCIÓN: Necesitas hacer login como admin');
    console.log('1. Ve a /admin/login');
    console.log('2. Inicia sesión con credenciales de admin');
    console.log('3. Vuelve a ejecutar este diagnóstico');
  }
}

// Exportar funciones para uso en consola
window.debugAdminAuth = {
  checkCookies,
  checkLocalStorage,
  checkAuthStatus,
  checkPendingOrders,
  clearAllAuth,
  runDiagnostic
};

// Ejecutar diagnóstico automáticamente
console.log('📋 Funciones disponibles:');
console.log('window.debugAdminAuth.runDiagnostic() - Diagnóstico completo');
console.log('window.debugAdminAuth.checkCookies() - Verificar cookies');
console.log('window.debugAdminAuth.checkAuthStatus() - Verificar auth');
console.log('window.debugAdminAuth.clearAllAuth() - Limpiar todo');

console.log('\n🔄 Ejecutando diagnóstico automático...');
runDiagnostic();
