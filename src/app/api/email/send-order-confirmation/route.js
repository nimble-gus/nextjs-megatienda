import { NextResponse } from 'next/server';
import { sendOrderConfirmationEmail } from '@/lib/email';

export async function POST(request) {
  try {
    const orderData = await request.json();
    
    // Validar datos requeridos
    const requiredFields = ['orderId', 'customerEmail', 'customerName', 'items', 'total'];
    const missingFields = requiredFields.filter(field => !orderData[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Faltan campos requeridos: ${missingFields.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Enviar email de confirmación
    const result = await sendOrderConfirmationEmail(orderData);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Email de confirmación enviado exitosamente',
        data: result.data
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error enviando email de confirmación',
          details: result.error 
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error en API de email:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

