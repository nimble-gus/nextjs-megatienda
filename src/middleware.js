import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Proteger rutas del admin
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const adminAccessToken = request.cookies.get('adminAccessToken')?.value;
    const adminRefreshToken = request.cookies.get('adminRefreshToken')?.value;

    // Si no hay tokens de admin, redirigir a login
    if (!adminAccessToken && !adminRefreshToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Verificar el access token
    if (adminAccessToken) {
      try {
        jwtVerify(adminAccessToken, JWT_SECRET);
        return NextResponse.next();
      } catch (error) {
        // Token expirado, pero hay refresh token, permitir acceso
        if (adminRefreshToken) {
          return NextResponse.next();
        }
        // No hay refresh token, redirigir a login
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
    }

    // Solo refresh token, permitir acceso
    if (adminRefreshToken) {
      return NextResponse.next();
    }
  }

  // Para rutas que no son admin, no hacer nada especial
  // Las cookies de admin y usuario normal son independientes

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
