'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import NewHamsterLoader from '../common/NewHamsterLoader';
import '@/styles/AdminProtected.css';

export default function AdminProtected({ children }) {
  const { adminUser, isLoading, isAdminAuthenticated } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // Si no está autenticado como admin, redirigir a login
      if (!isAdminAuthenticated) {
        console.log('🔒 Usuario no autenticado como admin, redirigiendo a login...');
        router.push('/admin/login');
        return;
      }

      console.log('✅ Usuario admin autenticado, acceso permitido');
    }
  }, [isLoading, isAdminAuthenticated, router]);

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

  // Si no está autenticado como admin, mostrar loading para evitar parpadeo
  if (!isAdminAuthenticated) {
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
