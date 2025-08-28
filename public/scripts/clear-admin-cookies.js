// Script para limpiar cookies de admin y forzar nuevo login
window.clearAdminCookies = function() {
  console.log('🧹 Limpiando cookies de admin...');
  
  // Limpiar cookies de admin
  document.cookie = 'adminAccessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'adminRefreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  
  // Limpiar localStorage
  localStorage.removeItem('adminUser');
  
  console.log('✅ Cookies de admin limpiadas');
  console.log('🔄 Redirigiendo a login de admin...');
  
  // Redirigir a login de admin
  window.location.href = '/admin/login';
};

// Función para verificar estado de cookies
window.checkAdminCookies = function() {
  console.log('🔍 Verificando cookies de admin...');
  
  const adminAccessToken = document.cookie.includes('adminAccessToken');
  const adminRefreshToken = document.cookie.includes('adminRefreshToken');
  const adminUser = localStorage.getItem('adminUser');
  
  console.log('🍪 adminAccessToken:', adminAccessToken ? '✅ Presente' : '❌ Ausente');
  console.log('🍪 adminRefreshToken:', adminRefreshToken ? '✅ Presente' : '❌ Ausente');
  console.log('💾 adminUser localStorage:', adminUser ? '✅ Presente' : '❌ Ausente');
  
  if (!adminAccessToken && !adminRefreshToken) {
    console.log('⚠️ No hay cookies de admin. Ejecuta clearAdminCookies() para limpiar y redirigir al login.');
  }
};

// Auto-ejecutar verificación
console.log('🔧 Script de limpieza de cookies admin cargado');
console.log('📋 Funciones disponibles:');
console.log('  clearAdminCookies() - Limpiar cookies y redirigir al login');
console.log('  checkAdminCookies() - Verificar estado de cookies');

// Verificar automáticamente
setTimeout(() => {
  checkAdminCookies();
}, 1000);
