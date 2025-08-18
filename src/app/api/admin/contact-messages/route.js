import { NextResponse } from 'next/server';
import { contactService } from '@/services/contactService';

export async function GET(request) {
  try {
    const result = await contactService.getAllMessages();
    
    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 500 });
    }
  } catch (error) {
    console.error('Error obteniendo mensajes:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}



