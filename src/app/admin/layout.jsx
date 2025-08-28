import { AdminAuthProvider } from '@/contexts/AdminAuthContext';
import { AdminOrdersProvider } from '@/contexts/AdminOrdersContext';
import WhatsappButton from '@/components/common/WhatsappButton';
import Script from 'next/script';

export default function AdminLayout({ children }) {
  return (
    <AdminAuthProvider>
      <AdminOrdersProvider>
        <div className="admin-layout">
          {children}
                            <WhatsappButton />
        </div>
        {/* Script de diagnóstico para admin */}
        <Script
          src="/scripts/debug-admin-auth.js"
          strategy="afterInteractive"
        />
        {/* Script de diagnóstico detallado */}
        <Script
          src="/scripts/admin-auth-debug.js"
          strategy="afterInteractive"
        />
      </AdminOrdersProvider>
    </AdminAuthProvider>
  );
}
