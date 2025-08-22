import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    });

    // Limpiar cookies de autenticación
    response.cookies.set('accessToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    });

    response.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('❌ Error en logout:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
