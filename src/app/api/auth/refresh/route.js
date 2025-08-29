import { NextResponse } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';
import mysql from 'mysql2/promise';
import tokenBlacklist from '@/lib/token-blacklist';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function POST(req) {
  try {
    console.log('🔄 Iniciando refresh de tokens...');
    
    // Obtener deviceId para identificar las cookies correctas
    const deviceId = req.cookies.get('deviceId')?.value;
    console.log('📱 DeviceId encontrado:', deviceId);
    
    let refreshToken = null;
    
    if (deviceId) {
      // Usar cookies específicas del dispositivo
      const refreshTokenCookieName = `refresh_${deviceId}`;
      refreshToken = req.cookies.get(refreshTokenCookieName)?.value;
      console.log('🔑 Refresh token específico del dispositivo:', !!refreshToken);
    }
    
    if (!refreshToken) {
      // Fallback a cookies legacy
      refreshToken = req.cookies.get('refreshToken')?.value;
      console.log('🔑 Refresh token legacy:', !!refreshToken);
    }

    if (!refreshToken) {
      console.log('❌ No hay refresh token disponible');
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
      console.log('✅ Refresh token válido para usuario:', payload.id);
    } catch (error) {
      console.error('❌ Error verificando refresh token:', error);
      return NextResponse.json(
        { error: 'Refresh token inválido o expirado' },
        { status: 401 }
      );
    }

    // Verificar que la sesión no esté en blacklist
    if (payload.sessionId && await tokenBlacklist.isSessionBlacklisted(payload.sessionId)) {
      console.log('❌ Sesión invalidada en blacklist');
      return NextResponse.json(
        { error: 'Sesión invalidada' },
        { status: 401 }
      );
    }

    // Verificar que el usuario aún existe en la base de datos
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL no está configurada');
    }

    const url = new URL(databaseUrl);
    const connectionConfig = {
      host: url.hostname,
      port: parseInt(url.port) || 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.substring(1),
      connectTimeout: 10000,
      acquireTimeout: 10000,
      timeout: 10000,
      reconnect: false
    };

    const connection = await mysql.createConnection(connectionConfig);

    try {
      const [users] = await connection.query(
        'SELECT id, nombre, correo, rol FROM usuarios WHERE id = ?',
        [payload.id]
      );

      if (users.length === 0) {
        console.log('❌ Usuario no encontrado en base de datos:', payload.id);
        return NextResponse.json(
          { error: 'Usuario no encontrado' },
          { status: 401 }
        );
      }

      const user = users[0];
      console.log('✅ Usuario encontrado:', user.nombre);

      // Generar nuevos tokens
      const newAccessToken = await new SignJWT({
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        rol: user.rol,
        sessionId: payload.sessionId || Date.now().toString() // Mantener sessionId existente
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('1h')
        .sign(JWT_SECRET);

      const newRefreshToken = await new SignJWT({
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        rol: user.rol,
        sessionId: payload.sessionId || Date.now().toString() // Mantener sessionId existente
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('7d')
        .sign(JWT_SECRET);

      // Crear respuesta y establecer nuevos tokens como cookies HttpOnly
      const response = NextResponse.json({
        success: true,
        user: {
          id: user.id,
          nombre: user.nombre,
          correo: user.correo,
          rol: user.rol
        },
        message: 'Tokens refrescados exitosamente'
      });

      if (deviceId) {
        // Establecer cookies específicas del dispositivo
        const accessTokenCookieName = `access_${deviceId}`;
        const refreshTokenCookieName = `refresh_${deviceId}`;
        
        response.cookies.set(accessTokenCookieName, newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 60 * 60, // 1 hora
          path: '/'
        });

        response.cookies.set(refreshTokenCookieName, newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60, // 7 días
          path: '/'
        });
        
        console.log('✅ Nuevos tokens establecidos para dispositivo:', deviceId);
      } else {
        // Fallback a cookies legacy
        response.cookies.set('accessToken', newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 60 * 60, // 1 hora
          path: '/'
        });

        response.cookies.set('refreshToken', newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60, // 7 días
          path: '/'
        });
        
        console.log('✅ Nuevos tokens legacy establecidos');
      }

      return response;

    } finally {
      await connection.end();
    }

  } catch (error) {
    console.error('❌ Error refrescando tokens:', error);
    console.error('Stack trace:', error.stack);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor al refrescar tokens',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
