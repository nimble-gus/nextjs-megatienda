import { NextResponse } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';
import tokenBlacklist from '@/lib/token-blacklist';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function GET(request) {
  try {
    // Obtener deviceId para identificar las cookies correctas
    const deviceId = request.cookies.get('deviceId')?.value;
    
    if (!deviceId) {
      return NextResponse.json({ 
        isAuthenticated: false, 
        message: 'No hay dispositivo identificado' 
      });
    }

    // Construir nombres de cookies específicos del dispositivo
    const accessTokenCookieName = `access_${deviceId}`;
    const refreshTokenCookieName = `refresh_${deviceId}`;
    
    const accessToken = request.cookies.get(accessTokenCookieName)?.value;
    const refreshToken = request.cookies.get(refreshTokenCookieName)?.value;
    
    // Si no hay ningún token, no está autenticado
    if (!accessToken && !refreshToken) {
      return NextResponse.json({ 
        isAuthenticated: false, 
        message: 'No hay tokens de autenticación para este dispositivo' 
      });
    }

    // Primero intentar con access token
    if (accessToken) {
      try {
        const { payload } = await jwtVerify(accessToken, JWT_SECRET);
        
        // Verificar si la sesión está en la blacklist
        if (await tokenBlacklist.isSessionBlacklisted(payload.sessionId)) {
          console.log('❌ Sesión invalidada en blacklist');
          return NextResponse.json({ 
            isAuthenticated: false, 
            message: 'Sesión invalidada' 
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
          sessionId: payload.sessionId,
          deviceId: deviceId,
          message: 'Token válido'
        });
      } catch (jwtError) {
        console.log('Access token expirado, intentando con refresh token...');
        // Access token expirado, continuar con refresh token
      }
    }

    // Si no hay access token válido, intentar con refresh token
    if (refreshToken) {
      try {
        const { payload } = await jwtVerify(refreshToken, JWT_SECRET);
        
        // Verificar si la sesión está en la blacklist
        if (await tokenBlacklist.isSessionBlacklisted(payload.sessionId)) {
          console.log('❌ Sesión invalidada en blacklist (refresh token)');
          return NextResponse.json({ 
            isAuthenticated: false, 
            message: 'Sesión invalidada' 
          });
        }
        
        // Si el refresh token es válido, generar nuevos tokens
        const newAccessToken = await new SignJWT({
          id: payload.id,
          nombre: payload.nombre,
          correo: payload.correo,
          rol: payload.rol,
          sessionId: payload.sessionId
        })
          .setProtectedHeader({ alg: 'HS256' })
          .setExpirationTime('1h')
          .sign(JWT_SECRET);

        // Crear respuesta con nuevos tokens
        const response = NextResponse.json({
          isAuthenticated: true,
          user: {
            id: payload.id,
            nombre: payload.nombre,
            correo: payload.correo,
            rol: payload.rol
          },
          sessionId: payload.sessionId,
          deviceId: deviceId,
          message: 'Tokens refrescados automáticamente'
        });

        // Establecer nuevo access token con nombre específico del dispositivo
        response.cookies.set(accessTokenCookieName, newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 60 * 60, // 1 hora
          path: '/'
        });

        return response;

      } catch (refreshError) {
        console.error('Error verificando refresh token:', refreshError);
        return NextResponse.json({ 
          isAuthenticated: false, 
          message: 'Tokens inválidos' 
        });
      }
    }
    
    // Si llegamos aquí, no hay tokens válidos
    return NextResponse.json({ 
      isAuthenticated: false, 
      message: 'Tokens inválidos' 
    });

  } catch (error) {
    console.error('❌ Error verificando estado de autenticación:', error);
    console.error('Stack trace:', error.stack);
    return NextResponse.json({ 
      isAuthenticated: false, 
      message: 'Error verificando autenticación',
      details: error.message
    }, { status: 500 });
  }
}
