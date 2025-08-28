import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma-production';
import { jwtVerify } from 'jose';

export async function DELETE(req) {
  try {
    // Obtener el token de autorización
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de autorización requerido' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verificar el token
    let payload;
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload: decodedPayload } = await jwtVerify(token, secret);
      payload = decodedPayload;
    } catch (error) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    const userId = payload.id;

    // Eliminar todos los items del carrito del usuario
    await prisma.carrito.deleteMany({
      where: {
        usuario_id: userId
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Carrito limpiado exitosamente'
    });

  } catch (error) {
    console.error('Error limpiando carrito:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
