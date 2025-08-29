import { NextResponse } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';
import tokenBlacklist from '@/lib/token-blacklist';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function GET(request) {
  try {
    console.log('🔍 Verificando estado de autenticación...');
    
    // Obtener deviceId para identificar las cookies correctas
    const deviceId = request.cookies.get('deviceId')?.value;
    console.log('📱 DeviceId encontrado:', deviceId);
    
    if (!deviceId) {
      console.log('❌ No hay deviceId, verificando cookies legacy...');
      
      // Fallback a cookies legacy
      const accessToken = request.cookies.get('accessToken')?.value;
      const refreshToken = request.cookies.get('refreshToken')?.value;
      
      console.log('🔑 Cookies legacy - accessToken:', !!accessToken, 'refreshToken:', !!refreshToken);
      
      if (!accessToken && !refreshToken) {
        console.log('❌ No hay tokens legacy');
        return NextResponse.json({ 
          isAuthenticated: false, 
          message: 'No hay dispositivo identificado ni tokens legacy' 
        });
      }

      // Verificar tokens legacy
      if (accessToken) {
        try {
          const { payload } = await jwtVerify(accessToken, JWT_SECRET);
          console.log('✅ Token legacy válido para usuario:', payload.id);
          
          if (await tokenBlacklist.isSessionBlacklisted(payload.sessionId)) {
            console.log('❌ Sesión legacy invalidada en blacklist');
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
            deviceId: null,
            message: 'Token legacy válido'
          });
        } catch (jwtError) {
          console.log('❌ Token legacy inválido, intentando refresh...');
        }
      }

      if (refreshToken) {
        try {
          const { payload } = await jwtVerify(refreshToken, JWT_SECRET);
          console.log('✅ Refresh token legacy válido para usuario:', payload.id);
          
          if (await tokenBlacklist.isSessionBlacklisted(payload.sessionId)) {
            console.log('❌ Sesión legacy invalidada en blacklist (refresh)');
            return NextResponse.json({ 
              isAuthenticated: false, 
              message: 'Sesión invalidada' 
            });
          }
          
          // Generar nuevo access token
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

          const response = NextResponse.json({
            isAuthenticated: true,
            user: {
              id: payload.id,
              nombre: payload.nombre,
              correo: payload.correo,
              rol: payload.rol
            },
            sessionId: payload.sessionId,
            deviceId: null,
            message: 'Tokens legacy refrescados'
          });

          response.cookies.set('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60, // 1 hora
            path: '/'
          });

          return response;
        } catch (refreshError) {
          console.log('❌ Refresh token legacy inválido');
          return NextResponse.json({ 
            isAuthenticated: false, 
            message: 'Tokens legacy inválidos' 
          });
        }
      }
      
      return NextResponse.json({ 
        isAuthenticated: false, 
        message: 'Tokens legacy inválidos' 
      });
    }

    // Construir nombres de cookies específicos del dispositivo
    const accessTokenCookieName = `access_${deviceId}`;
    const refreshTokenCookieName = `refresh_${deviceId}`;
    
    const accessToken = request.cookies.get(accessTokenCookieName)?.value;
    const refreshToken = request.cookies.get(refreshTokenCookieName)?.value;
    
    console.log('🔑 Cookies específicas del dispositivo:');
    console.log('  - accessToken:', !!accessToken);
    console.log('  - refreshToken:', !!refreshToken);
    
    // Si no hay ningún token, no está autenticado
    if (!accessToken && !refreshToken) {
      console.log('❌ No hay tokens específicos del dispositivo');
      return NextResponse.json({ 
        isAuthenticated: false, 
        message: 'No hay tokens de autenticación para este dispositivo' 
      });
    }

    // Primero intentar con access token
    if (accessToken) {
      try {
        const { payload } = await jwtVerify(accessToken, JWT_SECRET);
        console.log('✅ Access token válido para usuario:', payload.id);
        
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
          message: 'Token específico del dispositivo válido'
        });
      } catch (jwtError) {
        console.log('❌ Access token específico expirado, intentando con refresh token...');
        // Access token expirado, continuar con refresh token
      }
    }

    // Si no hay access token válido, intentar con refresh token
    if (refreshToken) {
      try {
        const { payload } = await jwtVerify(refreshToken, JWT_SECRET);
        console.log('✅ Refresh token válido para usuario:', payload.id);
        
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
          message: 'Tokens específicos del dispositivo refrescados automáticamente'
        });

        // Establecer nuevo access token con nombre específico del dispositivo
        response.cookies.set(accessTokenCookieName, newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 60 * 60, // 1 hora
          path: '/'
        });

        console.log('✅ Nuevo access token establecido para dispositivo:', deviceId);
        return response;

      } catch (refreshError) {
        console.log('❌ Error verificando refresh token específico:', refreshError.message);
        return NextResponse.json({ 
          isAuthenticated: false, 
          message: 'Tokens específicos del dispositivo inválidos' 
        });
      }
    }
    
    // Si llegamos aquí, no hay tokens válidos
    console.log('❌ No hay tokens válidos');
    return NextResponse.json({ 
      isAuthenticated: false, 
      message: 'Tokens específicos del dispositivo inválidos' 
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
