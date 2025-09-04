import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { SignJWT } from 'jose';
import { executeQuery } from '@/lib/mysql-direct';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function POST(request) {
  try {
    const { nombre, email, password } = await request.json();

    // Validar campos requeridos
    if (!nombre || !email || !password) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      );
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Verificar si el email ya existe
    const existingUserQuery = `
      SELECT id FROM usuarios WHERE correo = ?
    `;
    
    const existingUser = await executeQuery(existingUserQuery, [email]);
    
    if (existingUser && existingUser.length > 0) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 409 }
      );
    }

    // Encriptar contraseña
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Crear nuevo usuario
    const insertUserQuery = `
      INSERT INTO usuarios (nombre, correo, contraseña, rol, creado_en)
      VALUES (?, ?, ?, 'cliente', NOW())
    `;
    
    const insertResult = await executeQuery(insertUserQuery, [
      nombre.trim(),
      email.toLowerCase().trim(),
      hashedPassword
    ]);

    if (!insertResult || !insertResult.insertId) {
      throw new Error('Error al crear usuario');
    }

    // Obtener el usuario creado
    const newUserQuery = `
      SELECT id, nombre, correo, rol, creado_en
      FROM usuarios
      WHERE id = ?
    `;
    
    const newUserResult = await executeQuery(newUserQuery, [insertResult.insertId]);
    
    if (!newUserResult || newUserResult.length === 0) {
      throw new Error('Error al obtener usuario creado');
    }

    const newUser = newUserResult[0];

    // Generar tokens
    const accessToken = await new SignJWT({
      userId: newUser.id,
      email: newUser.correo,
      rol: newUser.rol,
      nombre: newUser.nombre
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(JWT_SECRET);

    const refreshToken = await new SignJWT({
      userId: newUser.id,
      email: newUser.correo,
      rol: newUser.rol
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    // Crear respuesta con cookies HttpOnly
    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        nombre: newUser.nombre,
        correo: newUser.correo,
        rol: newUser.rol,
        creado_en: newUser.creado_en
      },
      message: 'Usuario registrado exitosamente'
    });

    // Configurar cookies HttpOnly específicas para cliente
    response.cookies.set('clientAccessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 horas
      path: '/'
    });

    response.cookies.set('clientRefreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 días
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Error en registro de cliente:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
