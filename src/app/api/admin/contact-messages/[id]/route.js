import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql-direct';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { action, respuesta } = body;

    switch (action) {
      case 'markAsRead':
        // Marcar mensaje como leído
        const markAsReadQuery = `
          UPDATE mensajes_contacto 
          SET leido = true 
          WHERE id = ?
        `;
        await executeQuery(markAsReadQuery, [id]);
        
        return NextResponse.json({
          success: true,
          message: 'Mensaje marcado como leído'
        });
        
      case 'respond':
        if (!respuesta) {
          return NextResponse.json(
            { success: false, message: 'La respuesta es requerida' },
            { status: 400 }
          );
        }
        
        // Responder al mensaje
        const respondQuery = `
          UPDATE mensajes_contacto 
          SET respuesta = ?, respondido = true, fecha_respuesta = NOW()
          WHERE id = ?
        `;
        await executeQuery(respondQuery, [respuesta, id]);
        
        return NextResponse.json({
          success: true,
          message: 'Respuesta enviada correctamente'
        });
        
      default:
        return NextResponse.json(
          { success: false, message: 'Acción no válida' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error en API de mensajes:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    // Verificar que el mensaje existe
    const checkMessageQuery = `
      SELECT id FROM mensajes_contacto WHERE id = ?
    `;
    
    const messageExists = await executeQuery(checkMessageQuery, [id]);
    
    if (!messageExists || messageExists.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Mensaje no encontrado' },
        { status: 404 }
      );
    }
    
    // Eliminar el mensaje
    const deleteQuery = `
      DELETE FROM mensajes_contacto WHERE id = ?
    `;
    
    await executeQuery(deleteQuery, [id]);

    return NextResponse.json({
      success: true,
      message: 'Mensaje eliminado correctamente'
    });

  } catch (error) {
    console.error('Error eliminando mensaje:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}






