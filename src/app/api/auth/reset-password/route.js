import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import passwordResetManager from '@/lib/password-reset-manager';

export async function POST(req) {
  try {
    const { token, newPassword } = await req.json();

    // Validar datos obligatorios
    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token y nueva contraseña son obligatorios' },
        { status: 400 }
      );
    }

    // Validar formato de contraseña
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Validar token
    const tokenValidation = await passwordResetManager.validateToken(token);

    if (!tokenValidation.valid) {
      return NextResponse.json(
        { error: tokenValidation.error },
        { status: 400 }
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
      // Hashear nueva contraseña
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Actualizar contraseña del usuario
      await connection.query(
        'UPDATE usuarios SET contraseña = ? WHERE id = ?',
        [hashedPassword, tokenValidation.userId]
      );

      // Marcar token como usado
      await passwordResetManager.markTokenAsUsed(token);

      console.log(`✅ Contraseña actualizada para usuario ${tokenValidation.user.correo}`);

      return NextResponse.json({
        success: true,
        message: 'Contraseña actualizada exitosamente'
      });

    } finally {
      await connection.end();
    }

  } catch (error) {
    console.error('❌ Error en reset-password:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// Endpoint para validar token sin cambiar contraseña
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token es obligatorio' },
        { status: 400 }
      );
    }

    // Validar token
    const tokenValidation = await passwordResetManager.validateToken(token);

    if (!tokenValidation.valid) {
      return NextResponse.json(
        { error: tokenValidation.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      valid: true,
      user: {
        nombre: tokenValidation.user.nombre,
        correo: tokenValidation.user.correo
      }
    });

  } catch (error) {
    console.error('❌ Error validando token:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error.message
      },
      { status: 500 }
    );
  }
}
