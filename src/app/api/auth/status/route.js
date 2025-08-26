import { NextResponse } from 'next/server';
import { sessionManager } from '@/lib/session-manager';

export async function GET(request) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value;
    
    if (!accessToken) {
      return NextResponse.json({ 
        isAuthenticated: false, 
        message: 'No hay token de acceso' 
      });
    }

    // Verificar el token
    const payload = await sessionManager.verifyAccessToken(accessToken);
    
    if (!payload) {
      return NextResponse.json({ 
        isAuthenticated: false, 
        message: 'Token inválido' 
      });
    }

    return NextResponse.json({
      isAuthenticated: true,
      user: {
        id: payload.id,
        nombre: payload.nombre,
        correo: payload.correo,
        rol: payload.rol
      },
      message: 'Token válido'
    });

  } catch (error) {
    console.error('Error verificando estado de autenticación:', error);
    return NextResponse.json({ 
      isAuthenticated: false, 
      message: 'Error verificando autenticación' 
    }, { status: 500 });
  }
}
