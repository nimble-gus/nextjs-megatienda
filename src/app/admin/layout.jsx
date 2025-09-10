import { AdminAuthProvider } from '@/contexts/AdminAuthContext';
import { AdminOrdersProvider } from '@/contexts/AdminOrdersContext';
import WhatsappButton from '@/components/common/WhatsappButton';

export default function AdminLayout({ children }) {
  return (
    <AdminAuthProvider>
      <AdminOrdersProvider>
        <div className="admin-layout">
          {children}
                            <WhatsappButton />
        </div>
      </AdminOrdersProvider>
    </AdminAuthProvider>
  );
}
