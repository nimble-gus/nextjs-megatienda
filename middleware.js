import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Rutas que requieren autenticación de admin
  const adminRoutes = ['/admin'];
  const authRoutes = ['/admin/login'];
  
  // Verificar si es una ruta de admin (excluyendo login)
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route)) && 
                      !authRoutes.some(route => pathname.startsWith(route));
  
  // Verificar si es una ruta de API de admin
  const isAdminApiRoute = pathname.startsWith('/api/admin');
  
  if (isAdminRoute || isAdminApiRoute) {
    const accessToken = request.cookies.get('accessToken')?.value;
    const refreshToken = request.cookies.get('refreshToken')?.value;
    
    let isAuthenticated = false;
    let isAdmin = false;
    
    // Verificar access token
    if (accessToken) {
      try {
        const { payload } = await jwtVerify(accessToken, JWT_SECRET);
        isAuthenticated = true;
        isAdmin = payload.role === 'admin';
      } catch (error) {
        console.log('Access token inválido o expirado');
      }
    }
    
    // Si no hay access token válido, verificar refresh token
    if (!isAuthenticated && refreshToken) {
      try {
        const { payload } = await jwtVerify(refreshToken, JWT_SECRET);
        if (payload.role === 'admin') {
          isAuthenticated = true;
          isAdmin = true;
          
          // Generar nuevo access token
          const { SignJWT } = await import('jose');
          const newAccessToken = await new SignJWT({
            userId: payload.userId,
            email: payload.email,
            role: payload.role,
            nombre: payload.nombre
          })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('1h')
            .sign(JWT_SECRET);
          
          const response = NextResponse.next();
          response.cookies.set('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60,
            path: '/'
          });
          
          return response;
        }
      } catch (error) {
        console.log('Refresh token inválido o expirado');
      }
    }
    
    // Si no está autenticado o no es admin, redirigir a login
    if (!isAuthenticated || !isAdmin) {
      if (isAdminRoute) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      } else if (isAdminApiRoute) {
        return NextResponse.json(
          { error: 'Acceso denegado' },
          { status: 401 }
        );
      }
    }
  }
  
  // Si está en login y ya está autenticado, redirigir a admin
  if (pathname === '/admin/login') {
    const accessToken = request.cookies.get('accessToken')?.value;
    if (accessToken) {
      try {
        const { payload } = await jwtVerify(accessToken, JWT_SECRET);
        if (payload.role === 'admin') {
          return NextResponse.redirect(new URL('/admin', request.url));
        }
      } catch (error) {
        // Token inválido, continuar con login
      }
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*'
  ]
};
