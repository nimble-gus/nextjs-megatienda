'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';

// Contexto de autenticación
const AuthContext = createContext();

// Hook para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// Provider del contexto de autenticación
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Verificar estado de autenticación al cargar
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/admin/status', {
        credentials: 'include'
      });

      const data = await response.json();

      if (data.authenticated && data.user) {
        setUser(data.user);
        console.log('✅ Usuario autenticado:', data.user.nombre);
      } else {
        setUser(null);
        console.log('❌ Usuario no autenticado');
      }
    } catch (error) {
      console.error('❌ Error verificando autenticación:', error);
      setError('Error verificando autenticación');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        console.log('✅ Login exitoso:', data.user.nombre);
        return { success: true, user: data.user };
      } else {
        setError(data.error || 'Error en el login');
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('❌ Error en login:', error);
      const errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/auth/admin/logout', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        setUser(null);
        setError(null);
        console.log('✅ Logout exitoso');
        router.push('/admin/login');
      } else {
        console.error('❌ Error en logout');
      }
    } catch (error) {
      console.error('❌ Error en logout:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshAuth = async () => {
    await checkAuthStatus();
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    refreshAuth,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
