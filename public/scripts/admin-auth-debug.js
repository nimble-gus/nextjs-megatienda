// Script de diagnóstico detallado para autenticación admin
window.adminAuthDebug = {
  // Verificar estado actual
  checkCurrentState: () => {
    console.log('🔍 === DIAGNÓSTICO DETALLADO DE AUTH ADMIN ===');
    
    // Verificar cookies
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {});
    
    console.log('🍪 Cookies encontradas:', cookies);
    console.log('🔑 adminAccessToken:', cookies.adminAccessToken ? '✅ Presente' : '❌ Ausente');
    console.log('🔄 adminRefreshToken:', cookies.adminRefreshToken ? '✅ Presente' : '❌ Ausente');
    
    // Verificar localStorage
    const adminUser = localStorage.getItem('adminUser');
    const user = localStorage.getItem('user');
    
    console.log('💾 localStorage adminUser:', adminUser ? '✅ Presente' : '❌ Ausente');
    console.log('💾 localStorage user:', user ? '✅ Presente' : '❌ Ausente');
    
    // Verificar estado de autenticación
    return {
      hasAdminCookies: !!(cookies.adminAccessToken || cookies.adminRefreshToken),
      hasAdminUser: !!adminUser,
      hasUser: !!user
    };
  },
  
  // Forzar logout completo
  forceLogout: () => {
    console.log('🧹 Forzando logout completo...');
    
    // Limpiar localStorage
    localStorage.clear();
    
    // Limpiar cookies
    const cookiesToRemove = [
      'adminAccessToken',
      'adminRefreshToken', 
      'accessToken',
      'refreshToken'
    ];
    
    cookiesToRemove.forEach(cookieName => {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/admin;`;
    });
    
    console.log('✅ Logout forzado completado');
  },
  
  // Redirigir al login
  goToLogin: () => {
    console.log('🔄 Redirigiendo al login de admin...');
    window.location.href = '/admin/login';
  },
  
  // Ejecutar fix completo
  runCompleteFix: () => {
    console.log('🔧 Ejecutando fix completo...');
    
    const state = window.adminAuthDebug.checkCurrentState();
    console.log('📊 Estado actual:', state);
    
    if (state.hasAdminCookies || state.hasAdminUser) {
      console.log('⚠️ Se detectó sesión de admin, forzando logout...');
      window.adminAuthDebug.forceLogout();
    }
    
    setTimeout(() => {
      window.adminAuthDebug.goToLogin();
    }, 1000);
  },
  
  // Probar API de admin
  testAdminAPI: async () => {
    console.log('🧪 Probando API de admin...');
    
    try {
      const response = await fetch('/api/admin/orders/pending-count', {
        credentials: 'include'
      });
      
      console.log('📡 Status:', response.status);
      console.log('📡 Headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API funcionando:', data);
      } else {
        const error = await response.json();
        console.log('❌ Error en API:', error);
      }
    } catch (error) {
      console.log('❌ Error de red:', error);
    }
  }
};

// Mostrar instrucciones
console.log('🔧 Script de diagnóstico de auth admin cargado');
console.log('📋 Funciones disponibles:');
console.log('window.adminAuthDebug.checkCurrentState() - Verificar estado');
console.log('window.adminAuthDebug.forceLogout() - Forzar logout');
console.log('window.adminAuthDebug.goToLogin() - Ir al login');
console.log('window.adminAuthDebug.runCompleteFix() - Fix completo');
console.log('window.adminAuthDebug.testAdminAPI() - Probar API');

// Ejecutar diagnóstico automático si estamos en /admin
if (window.location.pathname === '/admin') {
  setTimeout(() => {
    console.log('🔄 Ejecutando diagnóstico automático...');
    window.adminAuthDebug.checkCurrentState();
    window.adminAuthDebug.testAdminAPI();
  }, 3000);
}
