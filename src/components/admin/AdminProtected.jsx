'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import NewHamsterLoader from '../common/NewHamsterLoader';

export default function AdminProtected({ children }) {
  const { user, loading, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!isAuthenticated || !isAdmin)) {

      setTimeout(() => {
        router.push('/admin/login');
      }, 100);
    }
  }, [loading, isAuthenticated, isAdmin, router]);

  // Mostrar loading mientras verifica autenticación
  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-content">
          <NewHamsterLoader size="medium" message="Verificando autenticación..." />
        </div>
      </div>
    );
  }

  // Si no está autenticado o no es admin, mostrar loading para evitar parpadeo
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="admin-loading">
        <div className="loading-content">
          <NewHamsterLoader size="medium" message="Redirigiendo..." />
        </div>
      </div>
    );
  }

  // Si está autenticado y es admin, mostrar contenido
  return children;
}
