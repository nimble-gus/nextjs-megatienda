import { NextResponse } from 'next/server';
import { contactService } from '@/services/contactService';

export async function POST(request) {
  try {
    const body = await request.json();
    const { nombre, email, asunto, mensaje } = body;

    // Validaciones básicas
    if (!nombre || !email || !asunto || !mensaje) {
      return NextResponse.json(
        { success: false, message: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Formato de email inválido' },
        { status: 400 }
      );
    }

    // Enviar mensaje
    const result = await contactService.sendMessage({
      nombre,
      email,
      asunto,
      mensaje
    });

    if (result.success) {
      return NextResponse.json(result, { status: 201 });
    } else {
      return NextResponse.json(result, { status: 500 });
    }

  } catch (error) {
    console.error('Error en API de contacto:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}






