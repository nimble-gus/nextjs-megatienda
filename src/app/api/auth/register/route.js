import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function POST(req) {
  try {
    const { nombre, correo, password } = await req.json();

    // Validar datos básicos
    if (!nombre || !correo || !password) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios' },
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
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const newUser = await prisma.usuarios.create({
      data: {
        nombre,
        correo,
        password: hashedPassword,
        rol: 'cliente',
      },
    });

    // Verificar JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET no está definida en .env");
      return NextResponse.json(
        { error: 'Error de configuración en el servidor' },
        { status: 500 }
      );
    }

    // Generar token JWT
    let token;
    try {
      token = jwt.sign(
        { id: newUser.id, correo: newUser.correo },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
    } catch (jwtError) {
      console.error('❌ Error al generar token JWT:', jwtError);
      return NextResponse.json(
        { error: 'No se pudo generar el token' },
        { status: 500 }
      );
    }

    // Respuesta sin enviar la contraseña
    return NextResponse.json({
      message: 'Usuario registrado correctamente',
      token,
      user: {
        id: newUser.id,
        nombre: newUser.nombre,
        correo: newUser.correo,
        rol: newUser.rol,
      },
    });

  } catch (error) {
    console.error('❌ Error inesperado en registro:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
