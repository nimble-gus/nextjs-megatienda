// Utilidad para limpiar completamente todas las sesiones
export const clearAllSessions = () => {
  try {
    // Limpiar localStorage completamente
    const keysToRemove = [
      'user',
      'adminUser',
      'token',
      'cart',
      'cartItems',
      'guestCart',
      'cartCount',
      'recentSearches',
      'searchHistory'
    ];

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });

    // Limpiar todas las cookies de autenticación
    const cookiesToRemove = [
      'accessToken',
      'refreshToken',
      'adminAccessToken',
      'adminRefreshToken'
    ];

    cookiesToRemove.forEach(cookieName => {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/admin;`;
    });

    console.log('🧹 Todas las sesiones limpiadas completamente');
    return true;
  } catch (error) {
    console.error('Error limpiando sesiones:', error);
    return false;
  }
};

// Función para verificar si hay sesiones activas
export const hasActiveSessions = () => {
  const hasLocalStorage = localStorage.getItem('user') || localStorage.getItem('adminUser');
  const hasCookies = document.cookie.includes('accessToken') || 
                    document.cookie.includes('refreshToken') ||
                    document.cookie.includes('adminAccessToken') ||
                    document.cookie.includes('adminRefreshToken');
  
  return hasLocalStorage || hasCookies;
};

// Función para limpiar solo sesiones de usuario normal
export const clearUserSessions = () => {
  try {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('cart');
    localStorage.removeItem('cartItems');
    localStorage.removeItem('guestCart');
    localStorage.removeItem('cartCount');
    
    document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    console.log('🧹 Sesiones de usuario limpiadas');
    return true;
  } catch (error) {
    console.error('Error limpiando sesiones de usuario:', error);
    return false;
  }
};

// Función para limpiar solo sesiones de admin
export const clearAdminSessions = () => {
  try {
    localStorage.removeItem('adminUser');
    
    document.cookie = 'adminAccessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'adminRefreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    console.log('🧹 Sesiones de admin limpiadas');
    return true;
  } catch (error) {
    console.error('Error limpiando sesiones de admin:', error);
    return false;
  }
};
