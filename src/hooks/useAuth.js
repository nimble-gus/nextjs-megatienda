'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { AuthClient } from '@/lib/auth/auth-client';
import { SessionManager } from '@/lib/auth/session-manager';
import { TokenManager } from '@/lib/auth/token-manager';

/**
 * Hook principal de autenticación
 * Integra AuthClient, SessionManager y TokenManager
 */
export const useAuth = () => {
  // Estado de autenticación
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Managers
  const authClient = useMemo(() => new AuthClient(), []);
  const sessionManager = useMemo(() => new SessionManager(), []);
  const tokenManager = useMemo(() => new TokenManager(), []);

  /**
   * Inicializar estado de autenticación
   */
  const initializeAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Verificar si hay sesión local
      if (sessionManager.hasActiveSession()) {
        const session = sessionManager.getCurrentSession();
        
        setUser(session.user);
        setIsAuthenticated(true);
        
        // Verificar estado en el servidor
        const serverStatus = await authClient.checkStatus();
        if (!serverStatus.isAuthenticated) {
          await handleLogout();
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('❌ [useAuth] Error inicializando autenticación:', error);
      setError('Error inicializando autenticación');
    } finally {
      setIsLoading(false);
    }
  }, [authClient, sessionManager]);

  /**
   * Login del usuario
   */
  const login = useCallback(async (email, password) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔐 [useAuth] Iniciando login...');

      const result = await authClient.login(email, password);

      if (result.success) {
        // Iniciar sesión en el SessionManager
        await sessionManager.startSession(result.user, {}, result.deviceId);
        
        // Actualizar estado
        setUser(result.user);
        setIsAuthenticated(true);
        
        console.log('✅ [useAuth] Login exitoso para:', result.user.nombre);
        return { success: true, user: result.user };
      } else {
        setError(result.error);
        console.warn('⚠️ [useAuth] Login falló:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMsg = 'Error de conexión';
      setError(errorMsg);
      console.error('❌ [useAuth] Error en login:', error);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [authClient, sessionManager]);

  /**
   * Logout del usuario
   */
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('🚪 [useAuth] Iniciando logout...');

      // Cerrar sesión en el servidor
      const result = await authClient.logout();
      
      // Cerrar sesión local
      await sessionManager.endSession();
      
      // Limpiar estado
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      
      console.log('✅ [useAuth] Logout completado');
      return { success: true };
    } catch (error) {
      console.error('❌ [useAuth] Error en logout:', error);
      // Aún así, limpiar estado local
      setUser(null);
      setIsAuthenticated(false);
      return { success: false, error: 'Error en logout' };
    } finally {
      setIsLoading(false);
    }
  }, [authClient, sessionManager]);

  /**
   * Registrar nuevo usuario
   */
  const register = useCallback(async (userData) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('📝 [useAuth] Iniciando registro...');

      const result = await authClient.register(userData);

      if (result.success) {
        console.log('✅ [useAuth] Registro exitoso para:', result.user.nombre);
        return { success: true, user: result.user };
      } else {
        setError(result.error);
        console.warn('⚠️ [useAuth] Registro falló:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMsg = 'Error de conexión';
      setError(errorMsg);
      console.error('❌ [useAuth] Error en registro:', error);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [authClient]);

  /**
   * Verificar estado de autenticación
   */
  const checkAuthStatus = useCallback(async () => {
    try {
      console.log('🔍 [useAuth] Verificando estado de autenticación...');

      const status = await authClient.checkStatus();

      if (status.isAuthenticated && status.user) {
        setUser(status.user);
        setIsAuthenticated(true);
        setError(null);
        console.log('✅ [useAuth] Usuario autenticado:', status.user.nombre);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        console.log('❌ [useAuth] Usuario no autenticado');
      }

      return status;
    } catch (error) {
      console.error('❌ [useAuth] Error verificando estado:', error);
      return { isAuthenticated: false, user: null };
    }
  }, [authClient]);

  /**
   * Refresh de token
   */
  const refreshToken = useCallback(async () => {
    try {
      console.log('🔄 [useAuth] Refrescando token...');

      const result = await authClient.refreshToken();

      if (result.success) {
        console.log('✅ [useAuth] Token refrescado exitosamente');
        return { success: true };
      } else {
        console.warn('⚠️ [useAuth] Refresh falló:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ [useAuth] Error refrescando token:', error);
      return { success: false, error: 'Error de conexión' };
    }
  }, [authClient]);

  /**
   * Manejador de logout automático
   */
  const handleLogout = useCallback(async () => {
    console.log('🔄 [useAuth] Logout automático iniciado');
    await logout();
  }, [logout]);

  // Event listeners para eventos de sesión
  useEffect(() => {
    const handleSessionExpired = () => {
      console.log('⏰ [useAuth] Sesión expirada, limpiando...');
      handleLogout();
    };

    const handleStorageChange = (e) => {
      if (e.key === 'clientUser' && !e.newValue) {
        console.log('🗄️ [useAuth] Usuario removido del storage, limpiando...');
        handleLogout();
      }
    };

    const handleCartAuthError = (e) => {
      console.log('🛒 [useAuth] Error de autenticación del carrito:', e.detail);
      if (e.detail.status === 401) {
        console.log('🔄 [useAuth] Intentando refresh de token...');
        refreshToken().then(result => {
          if (!result.success) {
            console.log('❌ [useAuth] Refresh falló, cerrando sesión...');
            handleLogout();
          }
        });
      }
    };

    // Escuchar eventos de sesión expirada
    window.addEventListener('sessionExpired', handleSessionExpired);
    
    // Escuchar cambios en localStorage
    window.addEventListener('storage', handleStorageChange);

    // Escuchar errores de autenticación del carrito
    window.addEventListener('cartAuthError', handleCartAuthError);

    return () => {
      window.removeEventListener('sessionExpired', handleSessionExpired);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartAuthError', handleCartAuthError);
    };
  }, [handleLogout, refreshToken]);

  // Inicializar autenticación al montar el componente
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Limpiar recursos al desmontar
  useEffect(() => {
    return () => {
      authClient.destroy();
      sessionManager.destroy();
      tokenManager.destroy();
    };
  }, [authClient, sessionManager, tokenManager]);

  return {
    // Estado
    user,
    isAuthenticated,
    isLoading,
    error,
    
    // Métodos
    login,
    logout,
    register,
    checkAuthStatus,
    refreshToken,
    
    // Utilidades
    hasUser: !!user,
    isAdmin: user?.rol === 'admin',
    isClient: user?.rol === 'cliente'
  };
};
