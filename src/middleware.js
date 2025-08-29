import { NextResponse } from 'next/server';

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
