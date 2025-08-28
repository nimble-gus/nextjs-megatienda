import { NextResponse } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';
import prisma from '@/lib/prisma-production';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function POST(request) {
  try {
    // Obtener el refresh token de las cookies
    const refreshToken = request.cookies.get('adminRefreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token es requerido' },
        { status: 401 }
      );
    }

    // Verificar el refresh token
    let payload;
    try {
      const { payload: decodedPayload } = await jwtVerify(refreshToken, JWT_SECRET);
      payload = decodedPayload;
    } catch (error) {
      return NextResponse.json(
        { error: 'Refresh token inválido' },
        { status: 401 }
      );
    }

    // Verificar que el usuario existe y es admin
    const user = await prisma.usuarios.findUnique({
      where: { id: payload.userId }
    });

    if (!user || user.rol !== 'admin') {
      return NextResponse.json(
        { error: 'Usuario no autorizado' },
        { status: 403 }
      );
    }

    // Generar nuevos tokens
    const newAccessToken = await new SignJWT({
      userId: user.id,
      email: user.correo,
      rol: user.rol,
      nombre: user.nombre
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(JWT_SECRET);

    const newRefreshToken = await new SignJWT({
      userId: user.id,
      email: user.correo,
      rol: user.rol
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    // Crear respuesta
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        rol: user.rol
      },
      message: 'Token refrescado exitosamente'
    });

    // Configurar nuevas cookies HttpOnly
    response.cookies.set('adminAccessToken', newAccessToken, {
      httpOnly: true,
      secure: false, // Cambiar a false para desarrollo local
      sameSite: 'lax', // Cambiar a lax para mejor compatibilidad
      maxAge: 60 * 60, // 1 hora
      path: '/'
    });

    response.cookies.set('adminRefreshToken', newRefreshToken, {
      httpOnly: true,
      secure: false, // Cambiar a false para desarrollo local
      sameSite: 'lax', // Cambiar a lax para mejor compatibilidad
      maxAge: 7 * 24 * 60 * 60, // 7 días
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Error en refresh de admin:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
