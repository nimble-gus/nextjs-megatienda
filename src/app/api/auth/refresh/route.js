import { NextResponse } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';
import mysql from 'mysql2/promise';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

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

    // Verificar el refresh token
    let payload;
    try {
      const { payload: decodedPayload } = await jwtVerify(refreshToken, JWT_SECRET);
      payload = decodedPayload;
    } catch (error) {
      console.error('❌ Error verificando refresh token:', error);
      return NextResponse.json(
        { error: 'Refresh token inválido o expirado' },
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
        return NextResponse.json(
          { error: 'Usuario no encontrado' },
          { status: 401 }
        );
      }

      const user = users[0];

      // Generar nuevos tokens
      const newAccessToken = await new SignJWT({
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        rol: user.rol,
        sessionId: payload.sessionId || Date.now().toString() // Mantener o crear sessionId
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('1h')
        .sign(JWT_SECRET);

      const newRefreshToken = await new SignJWT({
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        rol: user.rol,
        sessionId: payload.sessionId || Date.now().toString() // Mantener o crear sessionId
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

      // Establecer nuevos tokens como cookies HttpOnly
      response.cookies.set('accessToken', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60, // 1 hora
        path: '/',
        domain: process.env.NODE_ENV === 'production' ? '.lamegatiendagt.vercel.app' : undefined
      });

      response.cookies.set('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60, // 7 días
        path: '/',
        domain: process.env.NODE_ENV === 'production' ? '.lamegatiendagt.vercel.app' : undefined
      });

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
