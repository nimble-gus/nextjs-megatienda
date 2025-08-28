'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { clearAdminSessions } from '@/utils/session-cleaner';

const AdminAuthContext = createContext();

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth debe ser usado dentro de un AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Función para verificar el estado de autenticación del admin
  const checkAdminAuthStatus = useCallback(async () => {
    try {
      // Solo verificar cookies de admin, no limpiar cookies de usuario normal
      // para evitar conflictos con la funcionalidad del carrito

      const response = await fetch('/api/auth/admin/status', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.isAuthenticated && data.user) {
          setAdminUser(data.user);
          setIsAdminAuthenticated(true);
          
          // Guardar en localStorage con clave específica para admin
          localStorage.setItem('adminUser', JSON.stringify(data.user));
        } else {
          // Token inválido, intentar refresh
          await attemptAdminTokenRefresh();
        }
      } else {
        // Error en la verificación, intentar refresh
        await attemptAdminTokenRefresh();
      }
    } catch (error) {
      console.error('Error checking admin auth status:', error);
      // En caso de error, intentar refresh
      await attemptAdminTokenRefresh();
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Función para intentar refrescar el token del admin
  const attemptAdminTokenRefresh = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/admin/refresh', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setAdminUser(data.user);
          setIsAdminAuthenticated(true);
          localStorage.setItem('adminUser', JSON.stringify(data.user));
          return true;
        }
      }
    } catch (error) {
      console.error('Error refreshing admin token:', error);
    }
    
    // Si el refresh falla, limpiar sesión
    setAdminUser(null);
    setIsAdminAuthenticated(false);
    localStorage.removeItem('adminUser');
    return false;
  }, []);

  // Función para hacer login del admin
  const adminLogin = useCallback(async (email, password) => {
    try {
      const response = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAdminUser(data.user);
        setIsAdminAuthenticated(true);
        localStorage.setItem('adminUser', JSON.stringify(data.user));
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error || 'Error en el login' };
      }
    } catch (error) {
      console.error('Error en admin login:', error);
      return { success: false, error: 'Error de conexión' };
    }
  }, []);

  // Función para hacer logout del admin
  const adminLogout = useCallback(async () => {
    try {
      // Llamar a la API de logout admin
      await fetch('/api/auth/admin/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error en admin logout:', error);
    } finally {
      // Limpiar estado local
      setAdminUser(null);
      setIsAdminAuthenticated(false);
      
      // Usar la utilidad para limpiar sesiones
      clearAdminSessions();
      
      
    }
  }, []);

  // Verificar autenticación al cargar
  useEffect(() => {
    checkAdminAuthStatus();
  }, [checkAdminAuthStatus]);

  // Verificar si hay datos de admin en localStorage al cargar
  useEffect(() => {
    try {
      const adminUserData = localStorage.getItem('adminUser');
      if (adminUserData && !adminUser) {
        try {
          const parsedUser = JSON.parse(adminUserData);
          setAdminUser(parsedUser);
          setIsAdminAuthenticated(true);
        } catch (error) {
          console.error('Error parsing admin user data:', error);
          localStorage.removeItem('adminUser');
        }
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }
  }, [adminUser]);

  const value = {
    adminUser,
    isAdminAuthenticated,
    isLoading,
    adminLogin,
    adminLogout,
    checkAdminAuthStatus
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};
