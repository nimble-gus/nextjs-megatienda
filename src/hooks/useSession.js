// src/hooks/useSession.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

export const useSession = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const refreshTimeoutRef = useRef(null);
  const refreshInProgressRef = useRef(false);

  // Función para obtener tokens del localStorage
  const getTokens = () => {
    if (typeof window === 'undefined') return null;
    
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const userData = localStorage.getItem('user');
    
    return {
      accessToken,
      refreshToken,
      user: userData ? JSON.parse(userData) : null
    };
  };

  // Función para guardar tokens en localStorage
  const saveTokens = (accessToken, refreshToken, userData) => {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Función para limpiar tokens
  const clearTokens = () => {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  };

  // Función para refrescar tokens
  const refreshTokens = useCallback(async () => {
    if (refreshInProgressRef.current) return;
    
    try {
      refreshInProgressRef.current = true;
      
      const { refreshToken } = getTokens();
      if (!refreshToken) {
        throw new Error('No hay refresh token disponible');
      }

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Error refrescando tokens');
      }

      const data = await response.json();
      
      saveTokens(data.accessToken, data.refreshToken, data.user);
      setUser(data.user);
      setIsAuthenticated(true);
      
      console.log('✅ Tokens refrescados exitosamente');
      
      // Programar próximo refresh
      scheduleTokenRefresh(data.accessToken);
      
    } catch (error) {
      console.error('❌ Error refrescando tokens:', error);
      logout();
    } finally {
      refreshInProgressRef.current = false;
    }
  }, []);

  // Función para programar refresh automático
  const scheduleTokenRefresh = useCallback((accessToken) => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = payload.exp - now;
      
      // Refrescar 5 minutos antes de que expire
      const refreshTime = Math.max(0, (timeUntilExpiry - 300) * 1000);
      
      refreshTimeoutRef.current = setTimeout(() => {
        refreshTokens();
      }, refreshTime);
      
      console.log(`🕐 Próximo refresh programado en ${Math.floor(refreshTime / 1000)} segundos`);
    } catch (error) {
      console.error('Error programando refresh:', error);
    }
  }, [refreshTokens]);

  // Función para verificar si el token está próximo a expirar
  const isTokenNearExpiry = useCallback((accessToken) => {
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = payload.exp - now;
      
      return timeUntilExpiry < 300; // 5 minutos
    } catch (error) {
      return true;
    }
  }, []);

  // Función para obtener access token válido
  const getValidAccessToken = useCallback(async () => {
    const { accessToken, refreshToken } = getTokens();
    
    if (!accessToken) {
      return null;
    }

    // Si el token está próximo a expirar, refrescarlo
    if (isTokenNearExpiry(accessToken)) {
      await refreshTokens();
      return getTokens().accessToken;
    }

    return accessToken;
  }, [isTokenNearExpiry, refreshTokens]);

  // Función para hacer requests autenticados
  const authenticatedFetch = useCallback(async (url, options = {}) => {
    const token = await getValidAccessToken();
    
    if (!token) {
      throw new Error('No hay token válido disponible');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401) {
      // Token expirado, intentar refresh
      await refreshTokens();
      const newToken = await getValidAccessToken();
      
      if (newToken) {
        // Reintentar request con nuevo token
        return fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${newToken}`,
            'Content-Type': 'application/json',
          },
        });
      } else {
        throw new Error('No se pudo renovar la sesión');
      }
    }

    return response;
  }, [getValidAccessToken, refreshTokens]);

  // Función para login
  const login = useCallback(async (credentials) => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error en el login');
      }

      const data = await response.json();
      
      saveTokens(data.accessToken, data.refreshToken, data.user);
      setUser(data.user);
      setIsAuthenticated(true);
      
      // Programar refresh automático
      scheduleTokenRefresh(data.accessToken);
      
      return data;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [scheduleTokenRefresh]);

  // Función para logout
  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
    setIsAuthenticated(false);
    
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
    
    // Redirigir al home
    router.push('/');
  }, [router]);

  // Función para verificar sesión al cargar
  const checkSession = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const { accessToken, refreshToken, user: savedUser } = getTokens();
      
      if (!accessToken || !refreshToken || !savedUser) {
        setIsAuthenticated(false);
        setUser(null);
        return;
      }

      // Verificar si el token está próximo a expirar
      if (isTokenNearExpiry(accessToken)) {
        await refreshTokens();
      } else {
        setUser(savedUser);
        setIsAuthenticated(true);
        scheduleTokenRefresh(accessToken);
      }
      
    } catch (error) {
      console.error('Error verificando sesión:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [isTokenNearExpiry, refreshTokens, scheduleTokenRefresh, logout]);

  // Efecto para verificar sesión al montar el componente
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshTokens,
    authenticatedFetch,
    getValidAccessToken,
    checkSession
  };
};
