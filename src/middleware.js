import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Rutas que requieren autenticación de admin
  const adminRoutes = ['/admin'];
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

  // Rutas de autenticación que no requieren verificación
  const authRoutes = ['/admin/login'];
  const isAuthRoute = authRoutes.some(route => pathname === route);

  // Si es una ruta de admin que no es login, verificar autenticación
  if (isAdminRoute && !isAuthRoute) {
    try {
      // Obtener tokens de las cookies
      const accessToken = request.cookies.get('accessToken')?.value;
      const refreshToken = request.cookies.get('refreshToken')?.value;

      if (!accessToken && !refreshToken) {
        console.log('🔒 No hay tokens, redirigiendo a login');
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }

      let isAuthenticated = false;
      let user = null;

      // Verificar access token
      if (accessToken) {
        try {
          const { payload } = await jwtVerify(accessToken, JWT_SECRET);
          if (payload.role === 'admin') {
            isAuthenticated = true;
            user = payload;
          }
        } catch (error) {
          console.log('Access token inválido, intentando refresh token');
        }
      }

      // Si no hay access token válido, verificar refresh token
      if (!isAuthenticated && refreshToken) {
        try {
          const { payload } = await jwtVerify(refreshToken, JWT_SECRET);
          
          // Verificar en la base de datos que el usuario existe y es admin
          const { prisma } = await import('@/lib/prisma');
          const dbUser = await prisma.usuarios.findUnique({
            where: { id: payload.userId }
          });

          if (dbUser && dbUser.rol === 'admin') {
            isAuthenticated = true;
            user = {
              userId: dbUser.id,
              email: dbUser.correo,
              role: dbUser.rol,
              nombre: dbUser.nombre
            };

            // Generar nuevo access token
            const { SignJWT } = await import('jose');
            const newAccessToken = await new SignJWT({
              userId: dbUser.id,
              email: dbUser.correo,
              role: dbUser.rol,
              nombre: dbUser.nombre
            })
              .setProtectedHeader({ alg: 'HS256' })
              .setIssuedAt()
              .setExpirationTime('1h')
              .sign(JWT_SECRET);

            // Crear respuesta con nuevo token
            const response = NextResponse.next();
            response.cookies.set('accessToken', newAccessToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'strict',
              maxAge: 60 * 60, // 1 hora
              path: '/'
            });

            return response;
          }
        } catch (error) {
          console.log('Refresh token inválido');
        }
      }

      if (!isAuthenticated) {
        console.log('🔒 Usuario no autenticado o sin permisos de admin');
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }

      // Usuario autenticado, continuar
      console.log('✅ Usuario autenticado:', user.nombre);
      return NextResponse.next();

    } catch (error) {
      console.error('❌ Error en middleware de autenticación:', error);
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Si está en login y ya está autenticado, redirigir al dashboard
  if (isAuthRoute) {
    try {
      const accessToken = request.cookies.get('accessToken')?.value;
      const refreshToken = request.cookies.get('refreshToken')?.value;

      if (accessToken || refreshToken) {
        let isAuthenticated = false;

        if (accessToken) {
          try {
            const { payload } = await jwtVerify(accessToken, JWT_SECRET);
            if (payload.role === 'admin') {
              isAuthenticated = true;
            }
          } catch (error) {
            // Token inválido, continuar con refresh token
          }
        }

        if (!isAuthenticated && refreshToken) {
          try {
            const { payload } = await jwtVerify(refreshToken, JWT_SECRET);
            const { prisma } = await import('@/lib/prisma');
            const dbUser = await prisma.usuarios.findUnique({
              where: { id: payload.userId }
            });

            if (dbUser && dbUser.rol === 'admin') {
              isAuthenticated = true;
            }
          } catch (error) {
            // Refresh token inválido
          }
        }

        if (isAuthenticated) {
          console.log('✅ Usuario ya autenticado, redirigiendo al dashboard');
          return NextResponse.redirect(new URL('/admin', request.url));
        }
      }
    } catch (error) {
      console.log('Error verificando autenticación en login');
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
