import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { sessionManager } from '@/lib/session-manager';
import { prisma } from '@/lib/prisma';

export async function POST(req) {
  try {
    const { nombre, correo, contraseña } = await req.json();

    console.log('📝 Procesando registro para:', correo);

    // Validar datos básicos
    if (!nombre || !correo || !contraseña) {
      console.log('❌ Campos faltantes en registro');
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

    console.log('🔍 Verificando si el usuario ya existe...');

    // Verificar usuario existente
    const existingUser = await prisma.usuarios.findUnique({
      where: { correo },
    });
    
    if (existingUser) {
      console.log('❌ Usuario ya existe:', correo);
      return NextResponse.json(
        { error: 'El correo ya está registrado' },
        { status: 400 }
      );
    }

    console.log('🔐 Encriptando contraseña...');

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    console.log('👤 Creando nuevo usuario...');

    // Crear usuario
    const newUser = await prisma.usuarios.create({
      data: {
        nombre,
        correo,
        password: hashedPassword,
        rol: 'cliente',
      },
    });

    console.log('✅ Usuario creado con ID:', newUser.id);

    // Crear sesión automáticamente después del registro
    const session = await sessionManager.createSession({
      id: newUser.id,
      nombre: newUser.nombre,
      correo: newUser.correo,
      rol: newUser.rol
    });

    console.log('🎉 Registro exitoso para:', correo);

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