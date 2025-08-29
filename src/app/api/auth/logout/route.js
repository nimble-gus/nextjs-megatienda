import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import tokenBlacklist from '@/lib/token-blacklist';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function POST(request) {
  try {
    console.log('🔓 Usuario cerrando sesión');

    // Obtener tokens actuales para invalidarlos
    const accessToken = request.cookies.get('accessToken')?.value;
    const refreshToken = request.cookies.get('refreshToken')?.value;

    // Invalidar tokens en la blacklist
    if (accessToken) {
      try {
        const { payload } = await jwtVerify(accessToken, JWT_SECRET);
        await tokenBlacklist.blacklistSession(payload.sessionId);
        console.log('✅ SessionId invalidado:', payload.sessionId);
      } catch (error) {
        console.log('Access token inválido, no se puede invalidar');
      }
    }

    if (refreshToken) {
      try {
        const { payload } = await jwtVerify(refreshToken, JWT_SECRET);
        await tokenBlacklist.blacklistSession(payload.sessionId);
        console.log('✅ SessionId invalidado desde refresh token:', payload.sessionId);
      } catch (error) {
        console.log('Refresh token inválido, no se puede invalidar');
      }
    }

    // Crear respuesta de éxito
    const response = NextResponse.json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    });

    // Eliminar cookies de autenticación usando delete()
    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');
    response.cookies.delete('sessionId');
    
    // También eliminar cookies de admin por si acaso
    response.cookies.delete('adminAccessToken');
    response.cookies.delete('adminRefreshToken');

    console.log('✅ Cookies limpiadas exitosamente');

    return response;

  } catch (error) {
    console.error('❌ Error en logout:', error);
    console.error('Stack trace:', error.stack);
    
    return NextResponse.json(
      { 
        error: 'Error al cerrar sesión',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// También manejar GET para compatibilidad
export async function GET(request) {
  return POST(request);
}
