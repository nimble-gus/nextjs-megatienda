import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Verificar si el modo mantenimiento está activado
  const maintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true' || 
                          process.env.MAINTENANCE_MODE === 'true';

  // Proteger rutas del admin PRIMERO (antes de verificar modo mantenimiento)
  // Esto asegura que la autenticación se aplique incluso durante el modo mantenimiento
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const adminAccessToken = request.cookies.get('adminAccessToken')?.value;
    const adminRefreshToken = request.cookies.get('adminRefreshToken')?.value;

    // Si no hay tokens de admin, redirigir a login
    if (!adminAccessToken && !adminRefreshToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Si el modo mantenimiento está activado
  if (maintenanceMode) {
    // Permitir acceso a:
    // - Admin login (para que puedan iniciar sesión)
    // - Rutas de admin (solo si ya pasaron la verificación de autenticación arriba)
    // - Rutas de API (para funcionalidades internas y autenticación)
    // - La página de mantenimiento misma
    // - Archivos estáticos
    
    // Si es admin/login, permitir siempre
    if (pathname === '/admin/login') {
      // No hacer nada, permitir acceso
    }
    // Si es cualquier otra ruta de admin, ya verificamos autenticación arriba
    // Si llegamos aquí y es /admin, significa que tiene tokens válidos
    else if (pathname.startsWith('/admin')) {
      // Ya pasó la verificación de autenticación arriba, permitir acceso
    }
    // Si es API, mantenimiento, o archivos estáticos, permitir
    else if (
      pathname.startsWith('/api') ||
      pathname === '/maintenance' ||
      pathname.startsWith('/_next') ||
      pathname === '/favicon.ico' ||
      pathname.startsWith('/assets')
    ) {
      // Permitir acceso
    }
    // Cualquier otra ruta, redirigir a mantenimiento
    else {
      return NextResponse.redirect(new URL('/maintenance', request.url));
    }
  }

  // Proteger rutas de cliente (opcional, para funcionalidades premium)
  if (pathname.startsWith('/profile') || pathname.startsWith('/orders')) {
    const clientAccessToken = request.cookies.get('clientAccessToken')?.value;
    const clientRefreshToken = request.cookies.get('clientRefreshToken')?.value;

    // Si no hay tokens de cliente, redirigir a home
    if (!clientAccessToken && !clientRefreshToken) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
