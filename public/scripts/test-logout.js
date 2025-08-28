// Script para probar el logout
console.log('🧪 Script de prueba de logout cargado');

// Función para verificar estado de autenticación
async function checkAuthStatus() {
  try {
    const response = await fetch('/api/auth/status', {
      credentials: 'include'
    });
    
    const data = await response.json();
    console.log('📊 Estado de autenticación:', data);
    
    return data.isAuthenticated;
  } catch (error) {
    console.error('❌ Error verificando estado:', error);
    return false;
  }
}

// Función para verificar cookies
function checkCookies() {
  try {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {});
    
    console.log('🍪 Cookies actuales:', cookies);
    return cookies;
  } catch (error) {
    console.error('❌ Error verificando cookies:', error);
    return {};
  }
}

// Función para verificar localStorage
function checkLocalStorage() {
  try {
    const user = localStorage.getItem('user');
    const adminUser = localStorage.getItem('adminUser');
    
    console.log('💾 localStorage user:', user ? 'Presente' : 'Ausente');
    console.log('💾 localStorage adminUser:', adminUser ? 'Presente' : 'Ausente');
    
    return { user, adminUser };
  } catch (error) {
    console.error('❌ Error verificando localStorage:', error);
    return { user: null, adminUser: null };
  }
}

// Función para hacer logout de usuario normal
async function performLogout() {
  try {
    console.log('🔒 Ejecutando logout de usuario normal...');
    
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });
    
    if (response.ok) {
      console.log('✅ Logout de usuario normal exitoso');
    } else {
      console.log('❌ Error en logout de usuario normal:', response.status);
    }
  } catch (error) {
    console.error('❌ Error ejecutando logout de usuario normal:', error);
  }
}

// Función para hacer logout de admin
async function performAdminLogout() {
  try {
    console.log('🔒 Ejecutando logout de admin...');
    
    const response = await fetch('/api/auth/admin/logout', {
      method: 'POST',
      credentials: 'include'
    });
    
    if (response.ok) {
      console.log('✅ Logout de admin exitoso');
    } else {
      console.log('❌ Error en logout de admin:', response.status);
    }
  } catch (error) {
    console.error('❌ Error ejecutando logout de admin:', error);
  }
}

// Función principal de prueba
async function testLogout() {
  console.log('\n=== PASO 1: Estado inicial ===');
  const initialAuth = await checkAuthStatus();
  const initialCookies = checkCookies();
  const initialStorage = checkLocalStorage();
  
  console.log('\n=== PASO 2: Ejecutando logout de usuario normal ===');
  await performLogout();
  
  console.log('\n=== PASO 3: Estado después del logout de usuario normal ===');
  const afterLogoutAuth = await checkAuthStatus();
  const afterLogoutCookies = checkCookies();
  const afterLogoutStorage = checkLocalStorage();
  
  console.log('\n=== RESUMEN ===');
  console.log('Antes del logout - Autenticado:', initialAuth);
  console.log('Después del logout - Autenticado:', afterLogoutAuth);
  console.log('Logout exitoso:', !afterLogoutAuth);
  
  if (afterLogoutAuth) {
    console.log('⚠️ PROBLEMA: El usuario sigue autenticado después del logout');
  } else {
    console.log('✅ ÉXITO: El logout funcionó correctamente');
  }
}

// Función para probar separación de sesiones
async function testSessionSeparation() {
  console.log('\n=== PRUEBA DE SEPARACIÓN DE SESIONES ===');
  
  console.log('\n1. Verificando estado inicial...');
  const initialCookies = checkCookies();
  const initialStorage = checkLocalStorage();
  
  console.log('\n2. Ejecutando logout de usuario normal...');
  await performLogout();
  
  console.log('\n3. Verificando que las cookies de admin permanecen...');
  const afterUserLogoutCookies = checkCookies();
  
  console.log('\n4. Ejecutando logout de admin...');
  await performAdminLogout();
  
  console.log('\n5. Verificando estado final...');
  const finalCookies = checkCookies();
  const finalStorage = checkLocalStorage();
  
  console.log('\n=== RESUMEN DE SEPARACIÓN ===');
  console.log('Cookies de usuario antes:', initialCookies.accessToken ? 'Presente' : 'Ausente');
  console.log('Cookies de admin antes:', initialCookies.adminAccessToken ? 'Presente' : 'Ausente');
  console.log('Cookies de usuario después de logout usuario:', afterUserLogoutCookies.accessToken ? 'Presente' : 'Ausente');
  console.log('Cookies de admin después de logout usuario:', afterUserLogoutCookies.adminAccessToken ? 'Presente' : 'Ausente');
  console.log('Cookies de admin después de logout admin:', finalCookies.adminAccessToken ? 'Presente' : 'Ausente');
}

// Exportar funciones para uso en consola
window.testLogout = {
  checkAuthStatus,
  checkCookies,
  checkLocalStorage,
  performLogout,
  performAdminLogout,
  testLogout,
  testSessionSeparation
};

console.log('📋 Funciones disponibles:');
console.log('window.testLogout.testLogout() - Ejecutar prueba completa de logout de usuario');
console.log('window.testLogout.testSessionSeparation() - Probar separación de sesiones');
console.log('window.testLogout.checkAuthStatus() - Verificar estado de auth');
console.log('window.testLogout.checkCookies() - Verificar cookies');
console.log('window.testLogout.checkLocalStorage() - Verificar localStorage');
console.log('window.testLogout.performLogout() - Ejecutar logout de usuario normal');
console.log('window.testLogout.performAdminLogout() - Ejecutar logout de admin');

console.log('✅ Script de prueba de logout cargado correctamente');
