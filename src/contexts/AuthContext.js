'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { clearUserSessions, clearAllSessions } from '@/utils/session-cleaner';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Función para verificar el estado de autenticación
  const checkAuthStatus = useCallback(async () => {
    try {
      // NO limpiar cookies de admin - mantener sesiones separadas
      // Las cookies de admin se manejan por separado en el contexto de admin

      const response = await fetch('/api/auth/status', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.isAuthenticated && data.user) {
          setUser(data.user);
          setIsAuthenticated(true);
          
          // Guardar en localStorage para persistencia
          localStorage.setItem('user', JSON.stringify(data.user));
        } else {
          // Token inválido, no intentar refresh automáticamente
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem('user');
        }
      } else {
        // Error en la verificación, no intentar refresh automáticamente
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      // En caso de error, no intentar refresh automáticamente
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Función para intentar refrescar el token
  const attemptTokenRefresh = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setUser(data.user);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(data.user));
          return true;
        }
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
    }
    
    // Si el refresh falla, limpiar sesión
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    return false;
  }, []);

  // Función para hacer logout
  const logout = useCallback(async () => {
    try {
      // Llamar a la API de logout
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      // Limpiar estado local
      setUser(null);
      setIsAuthenticated(false);
      
      // Usar la utilidad para limpiar solo sesiones de usuario normal
      clearUserSessions();
      
      console.log('🔒 Logout de usuario completado - sesiones de usuario limpiadas');
    }
  }, []);

  // Función para actualizar datos del usuario
  const updateUser = useCallback((userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
  }, []);

  // Función para hacer login
  const login = useCallback(async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ correo: email, contraseña: password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUser(data.user);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(data.user));
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.message || 'Error en el login' };
      }
    } catch (error) {
      console.error('Error en login:', error);
      return { success: false, error: 'Error de conexión' };
    }
  }, []);

  // Verificar si el usuario es admin
  const isAdmin = useCallback(() => {
    return user?.rol === 'admin';
  }, [user]);

  // Verificar autenticación al montar el componente
  useEffect(() => {
    // Verificar si hay datos de admin en localStorage y limpiarlos si existen
    const adminUser = localStorage.getItem('adminUser');
    if (adminUser) {
      console.log('🔒 Detectado usuario admin en localStorage, limpiando...');
      localStorage.removeItem('adminUser');
    }

    // Siempre verificar el estado de autenticación con el servidor
    // para asegurar que las cookies siguen siendo válidas
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Configurar un intervalo para verificar la autenticación periódicamente
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(() => {
        // Verificar si hay datos de admin y limpiarlos
        const adminUser = localStorage.getItem('adminUser');
        if (adminUser) {
          console.log('🔒 Detectado usuario admin en localStorage, limpiando...');
          localStorage.removeItem('adminUser');
        }
        
        checkAuthStatus();
      }, 5 * 60 * 1000); // Verificar cada 5 minutos

      return () => clearInterval(interval);
    }
  }, [isAuthenticated, checkAuthStatus]);

  const value = {
    user,
    isLoading,
    isAuthenticated,
    logout,
    updateUser,
    checkAuthStatus,
    login,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
