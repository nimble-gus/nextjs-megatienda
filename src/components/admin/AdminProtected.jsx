'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import NewHamsterLoader from '../common/NewHamsterLoader';
import '@/styles/AdminProtected.css';

export default function AdminProtected({ children }) {
  const { user, isLoading, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // Si no está autenticado, redirigir a login
      if (!isAuthenticated) {
        console.log('🔒 Usuario no autenticado, redirigiendo a login...');
        router.push('/admin/login');
        return;
      }

      // Si está autenticado pero no es admin, redirigir a login
      if (!isAdmin()) {
        console.log('🚫 Usuario no es admin, redirigiendo a login...');
        router.push('/admin/login');
        return;
      }

      console.log('✅ Usuario admin autenticado, acceso permitido');
    }
  }, [isLoading, isAuthenticated, isAdmin, router]);

  // Mostrar loading mientras verifica autenticación
  if (isLoading) {
    return (
      <div className="admin-loading">
        <div className="loading-content">
          <NewHamsterLoader size="medium" message="Verificando permisos..." />
        </div>
      </div>
    );
  }

  // Si no está autenticado o no es admin, mostrar loading para evitar parpadeo
  if (!isAuthenticated || !isAdmin()) {
    return (
      <div className="admin-loading">
        <div className="loading-content">
          <NewHamsterLoader size="medium" message="Redirigiendo..." />
        </div>
      </div>
    );
  }

  // Usuario autenticado y es admin, mostrar contenido
  return <>{children}</>;
}
