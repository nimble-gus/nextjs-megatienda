import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import { SignJWT } from 'jose';
import failedLoginManager from '@/lib/failed-login-manager';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function POST(req) {
  try {
    const { correo, contraseña } = await req.json();

    // Validar datos obligatorios
    if (!correo || !contraseña) {
      return NextResponse.json(
        { error: 'Correo y contraseña son obligatorios' },
        { status: 400 }
      );
    }

    // Obtener IP y User Agent para protección contra ataques
    const ipAddress = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Verificar si el email/IP está bloqueado
    const blockStatus = await failedLoginManager.isBlocked(correo, ipAddress);
    
    if (blockStatus.isBlocked) {
      return NextResponse.json(
        { 
          error: `Cuenta temporalmente bloqueada. Intenta de nuevo en ${blockStatus.remainingMinutes} minutos.`,
          attempts: blockStatus.attempts,
          remainingMinutes: blockStatus.remainingMinutes
        },
        { status: 429 } // Too Many Requests
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

    // Crear conexión
    const connection = await mysql.createConnection(connectionConfig);

    try {
      // Buscar usuario por correo
      const [users] = await connection.query(
        'SELECT id, nombre, correo, contraseña, rol FROM usuarios WHERE correo = ?',
        [correo]
      );

      if (users.length === 0) {
        // Registrar intento fallido (usuario no existe)
        await failedLoginManager.recordFailedAttempt(correo, ipAddress, userAgent);
        
        return NextResponse.json(
          { error: 'Usuario no encontrado' },
          { status: 400 }
        );
      }

      const user = users[0];

      // Verificar contraseña
      const validPassword = await bcrypt.compare(contraseña, user.contraseña);
      if (!validPassword) {
        // Registrar intento fallido
        await failedLoginManager.recordFailedAttempt(correo, ipAddress, userAgent);
        
        return NextResponse.json(
          { error: 'Contraseña incorrecta' },
          { status: 400 }
        );
      }

      // Login exitoso - resetear intentos fallidos
      await failedLoginManager.resetAttempts(correo, ipAddress);

      // Generar sessionId único con más información del dispositivo
      const acceptLanguage = req.headers.get('accept-language') || 'unknown';
      
      // Crear un fingerprint más único del dispositivo
      const deviceFingerprint = `${userAgent.substring(0, 30)}-${ipAddress}-${acceptLanguage.substring(0, 10)}`.replace(/[^a-zA-Z0-9-]/g, '');
      const randomString = Math.random().toString(36).substr(2, 15);
      const timestamp = Date.now();
      
      const sessionId = `${user.id}-${timestamp}-${deviceFingerprint}-${randomString}`;
      
      // Crear tokens JWT con sessionId único
      const accessToken = await new SignJWT({
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        rol: user.rol,
        sessionId: sessionId // Identificador único de sesión
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('1h')
        .sign(JWT_SECRET);

      const refreshToken = await new SignJWT({
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        rol: user.rol,
        sessionId: sessionId // Mismo sessionId para ambos tokens
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('7d')
        .sign(JWT_SECRET);

      // Crear respuesta con cookies
      const response = NextResponse.json({
        success: true,
        message: 'Login exitoso',
        user: {
          id: user.id,
          nombre: user.nombre,
          correo: user.correo,
          rol: user.rol
        },
        sessionId: sessionId // Devolver sessionId para debugging
      });

      // Crear nombres de cookies únicos por dispositivo
      const deviceHash = Buffer.from(deviceFingerprint).toString('base64').substring(0, 16);
      const accessTokenCookieName = `access_${deviceHash}`;
      const refreshTokenCookieName = `refresh_${deviceHash}`;

      // Establecer cookies con nombres únicos por dispositivo
      response.cookies.set(accessTokenCookieName, accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60, // 1 hora
        path: '/',
        domain: undefined // Forzar sin dominio para evitar compartir
      });

      response.cookies.set(refreshTokenCookieName, refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60, // 7 días
        path: '/',
        domain: undefined // Forzar sin dominio para evitar compartir
      });

      // Cookie para identificar el dispositivo
      response.cookies.set('deviceId', deviceHash, {
        httpOnly: false, // Necesario para que el frontend pueda leerlo
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 365 * 24 * 60 * 60, // 1 año
        path: '/',
        domain: undefined // Forzar sin dominio para evitar compartir
      });

      return response;

    } finally {
      await connection.end();
    }

  } catch (error) {
    console.error('❌ Error inesperado en login:', error);
    console.error('Stack trace:', error.stack);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error.message
      },
      { status: 500 }
    );
  }
}