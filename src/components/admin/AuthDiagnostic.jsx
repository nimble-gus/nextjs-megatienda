'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

export default function AuthDiagnostic() {
  const { adminUser, isLoading, isAdminAuthenticated } = useAdminAuth();
  const [cookies, setCookies] = useState({});
  const [apiTest, setApiTest] = useState(null);

  useEffect(() => {
    // Verificar cookies disponibles
    const checkCookies = () => {
      const adminAccessToken = document.cookie.includes('adminAccessToken');
      const adminRefreshToken = document.cookie.includes('adminRefreshToken');
      const accessToken = document.cookie.includes('accessToken');
      const refreshToken = document.cookie.includes('refreshToken');
      
      setCookies({
        adminAccessToken,
        adminRefreshToken,
        accessToken,
        refreshToken
      });
    };

    checkCookies();

    // Test API endpoint
    const testApi = async () => {
      try {
        const response = await fetch('/api/admin/orders/pending-count', {
          credentials: 'include'
        });
        setApiTest({
          status: response.status,
          ok: response.ok,
          statusText: response.statusText
        });
      } catch (error) {
        setApiTest({
          error: error.message
        });
      }
    };

    testApi();
  }, []);

  if (!process.env.NODE_ENV === 'development') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: '#f0f0f0',
      border: '1px solid #ccc',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 9999
    }}>
      <h4>🔍 Auth Diagnostic</h4>
      <div>
        <strong>Admin Auth:</strong> {isAdminAuthenticated ? '✅' : '❌'}
      </div>
      <div>
        <strong>Loading:</strong> {isLoading ? '⏳' : '✅'}
      </div>
      <div>
        <strong>Admin User:</strong> {adminUser ? adminUser.nombre : 'None'}
      </div>
      <div>
        <strong>Cookies:</strong>
        <ul style={{ margin: '5px 0', paddingLeft: '15px' }}>
          <li>adminAccessToken: {cookies.adminAccessToken ? '✅' : '❌'}</li>
          <li>adminRefreshToken: {cookies.adminRefreshToken ? '✅' : '❌'}</li>
          <li>accessToken: {cookies.accessToken ? '✅' : '❌'}</li>
          <li>refreshToken: {cookies.refreshToken ? '✅' : '❌'}</li>
        </ul>
      </div>
      <div>
        <strong>API Test:</strong>
        {apiTest ? (
          <div style={{ color: apiTest.ok ? 'green' : 'red' }}>
            Status: {apiTest.status} {apiTest.statusText}
          </div>
        ) : (
          'Testing...'
        )}
      </div>
    </div>
  );
}
