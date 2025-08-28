// Script para probar la separación de sesiones entre usuario normal y admin
console.log('🧪 Script de prueba de separación de sesiones cargado');

// Función para verificar estado de autenticación de usuario normal
async function checkUserAuthStatus() {
  try {
    const response = await fetch('/api/auth/status', {
      credentials: 'include'
    });
    
    const data = await response.json();
    console.log('📊 Estado de autenticación de usuario:', data);
    
    return data.isAuthenticated;
  } catch (error) {
    console.error('❌ Error verificando estado de usuario:', error);
    return false;
  }
}

// Función para verificar estado de autenticación de admin
async function checkAdminAuthStatus() {
  try {
    const response = await fetch('/api/auth/admin/status', {
      credentials: 'include'
    });
    
    const data = await response.json();
    console.log('📊 Estado de autenticación de admin:', data);
    
    return data.isAuthenticated;
  } catch (error) {
    console.error('❌ Error verificando estado de admin:', error);
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
async function performUserLogout() {
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

// Función principal de prueba de separación
async function testSessionSeparation() {
  console.log('\n=== PRUEBA DE SEPARACIÓN DE SESIONES ===');
  
  console.log('\n1. Verificando estado inicial...');
  const initialUserAuth = await checkUserAuthStatus();
  const initialAdminAuth = await checkAdminAuthStatus();
  const initialCookies = checkCookies();
  const initialStorage = checkLocalStorage();
  
  console.log('\n2. Ejecutando logout de usuario normal...');
  await performUserLogout();
  
  console.log('\n3. Verificando estado después del logout de usuario...');
  const afterUserLogoutUserAuth = await checkUserAuthStatus();
  const afterUserLogoutAdminAuth = await checkAdminAuthStatus();
  const afterUserLogoutCookies = checkCookies();
  const afterUserLogoutStorage = checkLocalStorage();
  
  console.log('\n4. Ejecutando logout de admin...');
  await performAdminLogout();
  
  console.log('\n5. Verificando estado final...');
  const finalUserAuth = await checkUserAuthStatus();
  const finalAdminAuth = await checkAdminAuthStatus();
  const finalCookies = checkCookies();
  const finalStorage = checkLocalStorage();
  
  console.log('\n=== RESUMEN DE SEPARACIÓN ===');
  console.log('Estado inicial - Usuario autenticado:', initialUserAuth);
  console.log('Estado inicial - Admin autenticado:', initialAdminAuth);
  console.log('Después logout usuario - Usuario autenticado:', afterUserLogoutUserAuth);
  console.log('Después logout usuario - Admin autenticado:', afterUserLogoutAdminAuth);
  console.log('Estado final - Usuario autenticado:', finalUserAuth);
  console.log('Estado final - Admin autenticado:', finalAdminAuth);
  
  console.log('\n=== VERIFICACIÓN DE COOKIES ===');
  console.log('Cookies de usuario antes:', initialCookies.accessToken ? 'Presente' : 'Ausente');
  console.log('Cookies de admin antes:', initialCookies.adminAccessToken ? 'Presente' : 'Ausente');
  console.log('Cookies de usuario después logout usuario:', afterUserLogoutCookies.accessToken ? 'Presente' : 'Ausente');
  console.log('Cookies de admin después logout usuario:', afterUserLogoutCookies.adminAccessToken ? 'Presente' : 'Ausente');
  console.log('Cookies de admin después logout admin:', finalCookies.adminAccessToken ? 'Presente' : 'Ausente');
  
  // Verificar que las sesiones están separadas
  const userLogoutPreservedAdmin = afterUserLogoutAdminAuth === initialAdminAuth;
  const adminLogoutDidNotAffectUser = finalUserAuth === afterUserLogoutUserAuth;
  
  console.log('\n=== RESULTADO DE LA PRUEBA ===');
  if (userLogoutPreservedAdmin) {
    console.log('✅ ÉXITO: El logout de usuario NO afectó la sesión de admin');
  } else {
    console.log('❌ PROBLEMA: El logout de usuario afectó la sesión de admin');
  }
  
  if (adminLogoutDidNotAffectUser) {
    console.log('✅ ÉXITO: El logout de admin NO afectó la sesión de usuario');
  } else {
    console.log('❌ PROBLEMA: El logout de admin afectó la sesión de usuario');
  }
}

// Exportar funciones para uso en consola
window.testSessionSeparation = {
  checkUserAuthStatus,
  checkAdminAuthStatus,
  checkCookies,
  checkLocalStorage,
  performUserLogout,
  performAdminLogout,
  testSessionSeparation
};

console.log('📋 Funciones disponibles:');
console.log('window.testSessionSeparation.testSessionSeparation() - Ejecutar prueba completa');
console.log('window.testSessionSeparation.checkUserAuthStatus() - Verificar estado de usuario');
console.log('window.testSessionSeparation.checkAdminAuthStatus() - Verificar estado de admin');
console.log('window.testSessionSeparation.checkCookies() - Verificar cookies');
console.log('window.testSessionSeparation.checkLocalStorage() - Verificar localStorage');
console.log('window.testSessionSeparation.performUserLogout() - Ejecutar logout de usuario');
console.log('window.testSessionSeparation.performAdminLogout() - Ejecutar logout de admin');

console.log('✅ Script de prueba de separación de sesiones cargado correctamente');
