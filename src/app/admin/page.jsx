import AdminProtected from '@/components/admin/AdminProtected';
import AdminDashboard from '@/components/admin/AdminDashboard';

export const metadata = {
  title: 'Admin Dashboard - Megatienda',
  description: 'Panel de administración de Megatienda',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function AdminPage() {
  return (
    <AdminProtected>
      <AdminDashboard />
    </AdminProtected>
  );
}
