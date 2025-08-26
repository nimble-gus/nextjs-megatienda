import AdminLogin from '@/components/admin/AdminLogin';

export const metadata = {
  title: 'Admin Login - Megatienda',
  description: 'Acceso exclusivo para administradores de Megatienda',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function AdminLoginPage() {
  return <AdminLogin />;
}
