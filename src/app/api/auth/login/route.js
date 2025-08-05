import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function POST(req) {
  try {
    const { correo, password } = await req.json();

    // Validar datos obligatorios
    if (!correo || !password) {
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
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return NextResponse.json(
        { error: 'Contraseña incorrecta' },
        { status: 400 }
      );
    }

    // Validar que exista JWT_SECRET
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
        { id: user.id, correo: user.correo },
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

    // Devolver respuesta sin el password
    return NextResponse.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        rol: user.rol,
      },
    });

  } catch (error) {
    console.error('❌ Error inesperado en login:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}