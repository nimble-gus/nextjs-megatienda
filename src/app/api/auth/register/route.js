import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { sessionManager } from '@/lib/session-manager';
import { prisma } from '@/lib/prisma';

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
    // Verificar usuario existente
    const existingUser = await prisma.usuarios.findUnique({
      where: { correo },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'El correo ya está registrado' },
        { status: 400 }
      );
    }
    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(contraseña, 10);
    // Crear usuario
    const newUser = await prisma.usuarios.create({
      data: {
        nombre,
        correo,
        password: hashedPassword,
        rol: 'cliente',
      },
    });
    // Crear sesión automáticamente después del registro
    const session = await sessionManager.createSession({
      id: newUser.id,
      nombre: newUser.nombre,
      correo: newUser.correo,
      rol: newUser.rol
    });
    // Respuesta con tokens
    return NextResponse.json({
      success: true,
      message: 'Usuario registrado correctamente',
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      user: session.user,
      expiresAt: session.expiresAt
    });

  } catch (error) {
    console.error('❌ Error inesperado en registro:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}