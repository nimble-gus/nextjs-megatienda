import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql-direct';

export async function GET(request) {
  try {
    // Obtener todos los mensajes de contacto ordenados por fecha de creación
    const messagesQuery = `
      SELECT 
        id,
        nombre,
        email,
        asunto,
        mensaje,
        leido,
        creado_en,
        respondido,
        respuesta,
        fecha_respuesta
      FROM mensajes_contacto
      ORDER BY creado_en DESC
    `;
    
    const messages = await executeQuery(messagesQuery);
    
    return NextResponse.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Error obteniendo mensajes:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error al obtener los mensajes',
        error: error.message 
      },
      { status: 500 }
    );
  }
}






