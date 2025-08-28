import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Crear respuesta de éxito
    const response = NextResponse.json({
      success: true,
      message: 'Logout de admin exitoso'
    });

    // Eliminar solo cookies de admin
    response.cookies.set('adminAccessToken', '', {
      httpOnly: true,
      secure: false, // Cambiar a false para desarrollo local
      sameSite: 'lax', // Cambiar a lax para mejor compatibilidad
      maxAge: 0, // Expirar inmediatamente
      path: '/'
    });

    response.cookies.set('adminRefreshToken', '', {
      httpOnly: true,
      secure: false, // Cambiar a false para desarrollo local
      sameSite: 'lax', // Cambiar a lax para mejor compatibilidad
      maxAge: 0, // Expirar inmediatamente
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Error en logout de admin:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
