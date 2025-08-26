import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { sessionManager } from '@/lib/session-manager';
import { prisma } from '@/lib/prisma';

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
    // Buscar usuario por correo
    const user = await prisma.usuarios.findUnique({
      where: { correo },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 400 }
      );
    }

    // Verificar contraseña
    const validPassword = await bcrypt.compare(contraseña, user.password);
    if (!validPassword) {
      return NextResponse.json(
        { error: 'Contraseña incorrecta' },
        { status: 400 }
      );
    }
    // Crear sesión con access y refresh tokens
    const session = await sessionManager.createSession({
      id: user.id,
      nombre: user.nombre,
      correo: user.correo,
      rol: user.rol
    });
    // Crear respuesta con cookies seguras
    const response = NextResponse.json({
      success: true,
      message: 'Login exitoso',
      user: session.user,
      expiresAt: session.expiresAt
    });

    // Configurar cookies HttpOnly seguras
    response.cookies.set('accessToken', session.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
      sameSite: 'strict',
      maxAge: 60 * 60, // 1 hora
      path: '/'
    });

    response.cookies.set('refreshToken', session.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 días
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('❌ Error inesperado en login:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}