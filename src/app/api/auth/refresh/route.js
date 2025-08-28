import { NextResponse } from 'next/server';
import { sessionManager } from '@/lib/session-manager';

export async function POST(req) {
  try {
    // Obtener refresh token de las cookies HttpOnly
    const refreshToken = req.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token es requerido' },
        { status: 401 }
      );
    }
    // Verificar y refrescar tokens
    const result = await sessionManager.refreshTokens(refreshToken);
    // Crear respuesta y establecer nuevos tokens como cookies HttpOnly
    const response = NextResponse.json({
      success: true,
      user: result.user,
      message: 'Tokens refrescados exitosamente'
    });

    // Establecer nuevos tokens como cookies HttpOnly
    response.cookies.set('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60, // 1 hora
      path: '/'
    });

    response.cookies.set('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 días
      path: '/'
    });
    return response;

  } catch (error) {
    console.error('❌ Error refrescando tokens:', error);
    
    return NextResponse.json(
      { 
        error: 'Token de refresh inválido o expirado',
        details: error.message 
      },
      { status: 401 }
    );
  }
}
