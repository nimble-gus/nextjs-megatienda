import AdminProtected from '@/components/admin/AdminProtected';
import AdminDashboard from '@/components/admin/AdminDashboard';

export const metadata = {
  title: 'Admin Dashboard - Megatienda',
  description: 'Panel de administración de Megatienda',
};

export default function AdminPage() {
  return (
    <AdminProtected>
      <AdminDashboard />
    </AdminProtected>
  );
}
