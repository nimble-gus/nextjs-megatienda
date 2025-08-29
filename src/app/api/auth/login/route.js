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

      // Generar sessionId único que incluya información del dispositivo
      const userAgent = req.headers.get('user-agent') || 'unknown';
      const deviceFingerprint = userAgent.substring(0, 50).replace(/[^a-zA-Z0-9]/g, '');
      const sessionId = `${user.id}-${Date.now()}-${deviceFingerprint}-${Math.random().toString(36).substr(2, 9)}`;
      
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
        }
      });

      // Establecer cookies con configuración más estricta
      response.cookies.set('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax', // Cambiar a 'lax' para mejor compatibilidad
        maxAge: 60 * 60, // 1 hora
        path: '/'
        // Remover domain para que funcione en todos los subdominios de Vercel
      });

      response.cookies.set('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax', // Cambiar a 'lax' para mejor compatibilidad
        maxAge: 7 * 24 * 60 * 60, // 7 días
        path: '/'
        // Remover domain para que funcione en todos los subdominios de Vercel
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