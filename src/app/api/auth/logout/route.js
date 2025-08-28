import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Crear respuesta de éxito
    const response = NextResponse.json({
      success: true,
      message: 'Logout exitoso'
    });

    // Eliminar cookies de autenticación de usuario normal
    response.cookies.set('accessToken', '', {
      httpOnly: true,
      secure: false, // Cambiar a false para desarrollo local
      sameSite: 'lax', // Cambiar a lax para mejor compatibilidad
      maxAge: 0, // Expirar inmediatamente
      path: '/'
    });

    response.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: false, // Cambiar a false para desarrollo local
      sameSite: 'lax', // Cambiar a lax para mejor compatibilidad
      maxAge: 0, // Expirar inmediatamente
      path: '/'
    });

    // NO eliminar cookies de admin - mantener sesiones separadas
    // Las cookies de admin se manejan por separado en el contexto de admin

    return response;
  } catch (error) {
    console.error('Error en logout:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
