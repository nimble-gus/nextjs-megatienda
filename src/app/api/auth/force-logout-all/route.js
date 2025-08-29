import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import mysql from 'mysql2/promise';
import tokenBlacklist from '@/lib/token-blacklist';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function POST(request) {
  try {
    console.log('🔒 Forzando logout en todos los dispositivos');

    // Obtener tokens actuales
    const accessToken = request.cookies.get('accessToken')?.value;
    const refreshToken = request.cookies.get('refreshToken')?.value;

    let userId = null;

    // Obtener userId de los tokens
    if (accessToken) {
      try {
        const { payload } = await jwtVerify(accessToken, JWT_SECRET);
        userId = payload.id;
      } catch (error) {
        console.log('Access token inválido');
      }
    }

    if (!userId && refreshToken) {
      try {
        const { payload } = await jwtVerify(refreshToken, JWT_SECRET);
        userId = payload.id;
      } catch (error) {
        console.log('Refresh token inválido');
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'No se pudo identificar al usuario' },
        { status: 401 }
      );
    }

    // Configuración de conexión
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
      // Invalidar TODAS las sesiones del usuario en la blacklist
      await connection.query(
        'INSERT IGNORE INTO session_blacklist (session_id, usuario_id) VALUES (?, ?)',
        [`force-logout-${userId}-${Date.now()}`, userId]
      );

      // También agregar un patrón para invalidar todas las sesiones del usuario
      await connection.query(
        'INSERT IGNORE INTO session_blacklist (session_id, usuario_id) VALUES (?, ?)',
        [`user-${userId}-all-sessions`, userId]
      );

      console.log(`✅ Todas las sesiones del usuario ${userId} han sido invalidadas`);

    } finally {
      await connection.end();
    }

    // Invalidar tokens actuales también
    if (accessToken) {
      try {
        const { payload } = await jwtVerify(accessToken, JWT_SECRET);
        if (payload.sessionId) {
          await tokenBlacklist.blacklistSession(payload.sessionId);
        }
      } catch (error) {
        console.log('No se pudo invalidar access token');
      }
    }

    if (refreshToken) {
      try {
        const { payload } = await jwtVerify(refreshToken, JWT_SECRET);
        if (payload.sessionId) {
          await tokenBlacklist.blacklistSession(payload.sessionId);
        }
      } catch (error) {
        console.log('No se pudo invalidar refresh token');
      }
    }

    // Crear respuesta de éxito
    const response = NextResponse.json({
      success: true,
      message: 'Sesión cerrada en todos los dispositivos'
    });

    // Eliminar todas las cookies
    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');
    response.cookies.delete('sessionId');
    response.cookies.delete('adminAccessToken');
    response.cookies.delete('adminRefreshToken');

    console.log('✅ Cookies limpiadas y sesiones invalidadas');

    return response;

  } catch (error) {
    console.error('❌ Error en force-logout-all:', error);
    
    return NextResponse.json(
      { 
        error: 'Error al cerrar sesión en todos los dispositivos',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
