import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function POST(req) {
  try {
    const { nombre, correo, contraseña } = await req.json();
    
    // Validar datos básicos
    if (!nombre || !correo || !contraseña) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios' },
        { status: 400 }
      );
    }

    // Validaciones adicionales
    if (nombre.length < 2) {
      return NextResponse.json(
        { error: 'El nombre debe tener al menos 2 caracteres' },
        { status: 400 }
      );
    }

    if (contraseña.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      return NextResponse.json(
        { error: 'Formato de email inválido' },
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
      // Verificar usuario existente
      const [existingUsers] = await connection.query(
        'SELECT id FROM usuarios WHERE correo = ?',
        [correo]
      );
      
      if (existingUsers.length > 0) {
        return NextResponse.json(
          { error: 'El correo ya está registrado' },
          { status: 400 }
        );
      }

      // Encriptar contraseña
      const hashedPassword = await bcrypt.hash(contraseña, 10);

      // Crear usuario
      const [result] = await connection.query(
        'INSERT INTO usuarios (nombre, correo, contraseña, rol) VALUES (?, ?, ?, ?)',
        [nombre, correo, hashedPassword, 'cliente']
      );

      const newUserId = result.insertId;

      // Obtener el usuario creado
      const [newUsers] = await connection.query(
        'SELECT id, nombre, correo, rol FROM usuarios WHERE id = ?',
        [newUserId]
      );

      const newUser = newUsers[0];

      // Crear tokens JWT
      const accessToken = await new SignJWT({
        id: newUser.id,
        nombre: newUser.nombre,
        correo: newUser.correo,
        rol: newUser.rol
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('1h')
        .sign(JWT_SECRET);

      const refreshToken = await new SignJWT({
        id: newUser.id,
        nombre: newUser.nombre,
        correo: newUser.correo,
        rol: newUser.rol
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('7d')
        .sign(JWT_SECRET);

      // Crear respuesta con cookies
      const response = NextResponse.json({
        success: true,
        message: 'Usuario registrado correctamente',
        user: {
          id: newUser.id,
          nombre: newUser.nombre,
          correo: newUser.correo,
          rol: newUser.rol
        }
      });

      // Establecer cookies
      response.cookies.set('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 // 1 hora
      });

      response.cookies.set('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 // 7 días
      });

      return response;

    } finally {
      await connection.end();
    }

  } catch (error) {
    console.error('❌ Error inesperado en registro:', error);
    console.error('Stack trace:', error.stack);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}