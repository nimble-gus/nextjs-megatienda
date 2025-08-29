import { NextResponse } from 'next/server';
import passwordResetManager from '@/lib/password-reset-manager';

export async function POST(req) {
  try {
    const { email } = await req.json();

    // Validar email
    if (!email) {
      return NextResponse.json(
        { error: 'Email es obligatorio' },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      );
    }

    // Crear token de reset
    const result = await passwordResetManager.createResetToken(email);

    if (!result.success) {
      // Por seguridad, no revelar si el email existe o no
      return NextResponse.json(
        { 
          success: true,
          message: 'Si el email existe en nuestra base de datos, recibirás un enlace de recuperación.'
        }
      );
    }

    // En un entorno real, aquí enviarías el email
    // Por ahora, retornamos el token para pruebas
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${result.token}`;

    console.log(`📧 Email de reset para ${email}: ${resetUrl}`);

    return NextResponse.json({
      success: true,
      message: 'Si el email existe en nuestra base de datos, recibirás un enlace de recuperación.',
      // Solo en desarrollo/testing
      ...(process.env.NODE_ENV === 'development' && {
        debug: {
          token: result.token,
          resetUrl,
          expiresAt: result.expiresAt
        }
      })
    });

  } catch (error) {
    console.error('❌ Error en forgot-password:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error.message
      },
      { status: 500 }
    );
  }
}
