import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function GET(request) {
  try {
    // Obtener cookies
    const accessToken = request.cookies.get('accessToken')?.value;
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (!accessToken && !refreshToken) {
      return NextResponse.json({
        authenticated: false,
        message: 'No hay tokens de autenticación'
      });
    }

    let user = null;
    let tokenValid = false;

    // Intentar verificar el access token primero
    if (accessToken) {
      try {
        const { payload } = await jwtVerify(accessToken, JWT_SECRET);
        user = {
          id: payload.userId,
          email: payload.email,
          role: payload.role,
          nombre: payload.nombre
        };
        tokenValid = true;
      } catch (error) {
        console.log('Access token inválido o expirado');
      }
    }

    // Si el access token no es válido, intentar con el refresh token
    if (!tokenValid && refreshToken) {
      try {
        const { payload } = await jwtVerify(refreshToken, JWT_SECRET);
        
        // Verificar que el usuario existe y es admin
        const { prisma } = await import('@/lib/prisma');
        const dbUser = await prisma.usuarios.findUnique({
          where: { id: payload.userId }
        });

        if (dbUser && dbUser.rol === 'admin') {
          user = {
            id: dbUser.id,
            email: dbUser.correo,
            role: dbUser.rol,
            nombre: dbUser.nombre
          };
          tokenValid = true;

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
          const response = NextResponse.json({
            authenticated: true,
            user,
            message: 'Token renovado'
          });

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
        console.log('Refresh token inválido o expirado');
      }
    }

    if (tokenValid && user && user.role === 'admin') {
      return NextResponse.json({
        authenticated: true,
        user,
        message: 'Usuario autenticado'
      });
    }

    return NextResponse.json({
      authenticated: false,
      message: 'Usuario no autenticado o sin permisos de admin'
    });

  } catch (error) {
    console.error('❌ Error verificando estado de autenticación:', error);
    return NextResponse.json(
      { 
        authenticated: false,
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
}
