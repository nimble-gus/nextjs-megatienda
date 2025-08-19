import { NextResponse } from 'next/server';
import { contactService } from '@/services/contactService';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { action, respuesta } = body;

    let result;

    switch (action) {
      case 'markAsRead':
        result = await contactService.markAsRead(id);
        break;
      case 'respond':
        if (!respuesta) {
          return NextResponse.json(
            { success: false, message: 'La respuesta es requerida' },
            { status: 400 }
          );
        }
        result = await contactService.respondToMessage(id, respuesta);
        break;
      default:
        return NextResponse.json(
          { success: false, message: 'Acción no válida' },
          { status: 400 }
        );
    }

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 500 });
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
    const result = await contactService.deleteMessage(id);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 500 });
    }

  } catch (error) {
    console.error('Error eliminando mensaje:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}




