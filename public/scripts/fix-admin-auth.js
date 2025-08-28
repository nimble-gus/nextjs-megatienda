// Script para forzar re-login de admin
window.fixAdminAuth = {
  // Limpiar todo el estado actual
  clearCurrentState: () => {
    console.log('🧹 Limpiando estado actual de admin...');
    
    // Limpiar localStorage
    localStorage.removeItem('adminUser');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    
    // Limpiar cookies manualmente
    document.cookie = 'adminAccessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'adminRefreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    console.log('✅ Estado limpiado');
  },
  
  // Redirigir al login de admin
  redirectToLogin: () => {
    console.log('🔄 Redirigiendo al login de admin...');
    window.location.href = '/admin/login';
  },
  
  // Ejecutar fix completo
  runFix: () => {
    console.log('🔧 Ejecutando fix completo de autenticación admin...');
    window.fixAdminAuth.clearCurrentState();
    
    // Forzar logout completo y redirigir al login
    setTimeout(() => {
      window.location.href = '/admin/login';
    }, 500);
  }
};

// Mostrar instrucciones
console.log('🔧 Script de fix de autenticación admin cargado');
console.log('📋 Funciones disponibles:');
console.log('window.fixAdminAuth.clearCurrentState() - Limpiar estado');
console.log('window.fixAdminAuth.redirectToLogin() - Ir al login');
console.log('window.fixAdminAuth.runFix() - Fix completo');

// Mostrar botón de fix si hay errores
if (window.location.pathname === '/admin') {
  setTimeout(() => {
    const fixButton = document.createElement('button');
    fixButton.textContent = '🔧 Fix Auth Admin';
    fixButton.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      background: #dc3545;
      color: white;
      border: none;
      padding: 10px 15px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
    `;
    fixButton.onclick = () => {
      if (confirm('¿Forzar re-login de admin? Esto limpiará la sesión actual.')) {
        window.fixAdminAuth.runFix();
      }
    };
    document.body.appendChild(fixButton);
  }, 2000);
}
