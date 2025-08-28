import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { SignJWT } from 'jose';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Validar campos requeridos
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Buscar usuario por email
    const user = await prisma.usuarios.findUnique({
      where: { correo: email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Verificar que sea admin
    if (user.rol !== 'admin') {
      return NextResponse.json(
        { error: 'Acceso denegado. Solo administradores pueden acceder.' },
        { status: 403 }
      );
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Generar tokens
    const accessToken = await new SignJWT({
      userId: user.id,
      email: user.correo,
      rol: user.rol,
      nombre: user.nombre
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(JWT_SECRET);

    const refreshToken = await new SignJWT({
      userId: user.id,
      email: user.correo,
      rol: user.rol
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    // Crear respuesta con cookies HttpOnly
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        rol: user.rol
      },
      message: 'Login exitoso'
    });

    // Configurar cookies HttpOnly específicas para admin
    response.cookies.set('adminAccessToken', accessToken, {
      httpOnly: true,
      secure: false, // Cambiar a false para desarrollo local
      sameSite: 'lax', // Cambiar a lax para mejor compatibilidad
      maxAge: 60 * 60, // 1 hora
      path: '/'
    });

    response.cookies.set('adminRefreshToken', refreshToken, {
      httpOnly: true,
      secure: false, // Cambiar a false para desarrollo local
      sameSite: 'lax', // Cambiar a lax para mejor compatibilidad
      maxAge: 7 * 24 * 60 * 60, // 7 días
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('❌ Error en admin login:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
