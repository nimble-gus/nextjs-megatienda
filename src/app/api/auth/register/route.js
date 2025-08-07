import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function POST(req) {
  try {
    // Cambié 'password' por 'contraseña' para mantener consistencia en español
    const { nombre, correo, contraseña } = await req.json();

    console.log('📝 Datos recibidos en registro:');
    console.log('- Nombre:', nombre);
    console.log('- Correo:', correo);
    console.log('- Contraseña:', contraseña ? '***hidden***' : 'undefined');

    // Validar datos básicos
    if (!nombre || !correo || !contraseña) {
      console.log('❌ Campos faltantes:');
      console.log('- Nombre:', !!nombre);
      console.log('- Correo:', !!correo);
      console.log('- Contraseña:', !!contraseña);
      
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
        password: hashedPassword, // En la BD sigue siendo 'password'
        rol: 'cliente',
      },
    });

    console.log('✅ Usuario creado con ID:', newUser.id);

    // Verificar JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET no está definida en .env");
      return NextResponse.json(
        { error: 'Error de configuración en el servidor' },
        { status: 500 }
      );
    }

    console.log('🔑 Generando token JWT...');

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

    console.log('🎉 Registro exitoso para:', correo);

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
    
    // Manejo específico de errores de Prisma
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'El correo ya está registrado' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}