import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { sessionManager } from '@/lib/session-manager';
import { prisma } from '@/lib/prisma';
import { CircuitBreakerManager } from '@/lib/circuit-breaker';
import { applyGlobalRateLimit, getRateLimitHeaders } from '@/lib/global-rate-limiter';
import { withDatabaseTimeout } from '@/lib/timeout-wrapper';

export async function POST(req) {
  try {
    // Aplicar rate limiting solo en producción
    if (process.env.NODE_ENV === 'production') {
      const rateLimitResult = await applyGlobalRateLimit(req, 'auth');
      if (!rateLimitResult.success) {
        const response = NextResponse.json(
          { error: 'Demasiados intentos de login. Intenta de nuevo en unos minutos.' },
          { status: 429 }
        );
        Object.entries(getRateLimitHeaders(rateLimitResult)).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
        return response;
      }
    }

    const { correo, contraseña } = await req.json();

    // Validar datos obligatorios
    if (!correo || !contraseña) {
      return NextResponse.json(
        { error: 'Correo y contraseña son obligatorios' },
        { status: 400 }
      );
    }

    // Usar circuit breaker para la operación de login
    const user = await CircuitBreakerManager.execute('login', async () => {
      return await withDatabaseTimeout(async () => {
        return await prisma.usuarios.findUnique({
          where: { correo },
        });
      }, 'login_find_user');
    }, { timeout: 10000 });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 400 }
      );
    }

    // Verificar contraseña
    const validPassword = await bcrypt.compare(contraseña, user.password);
    if (!validPassword) {
      return NextResponse.json(
        { error: 'Contraseña incorrecta' },
        { status: 400 }
      );
    }

    // Crear sesión con access y refresh tokens
    const session = await sessionManager.createSession({
      id: user.id,
      nombre: user.nombre,
      correo: user.correo,
      rol: user.rol
    });

    // Crear respuesta con cookies seguras
    const response = NextResponse.json({
      success: true,
      message: 'Login exitoso',
      user: session.user,
      expiresAt: session.expiresAt
    });

    // Configurar cookies HttpOnly seguras
    response.cookies.set('accessToken', session.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60, // 1 hora
      path: '/'
    });

    response.cookies.set('refreshToken', session.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 días
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('❌ Error inesperado en login:', error);

    // Manejar errores específicos de Prisma
    if (error.name === 'PrismaClientInitializationError') {
      return NextResponse.json(
        { 
          error: 'Error de conexión a la base de datos',
          message: 'El servicio está temporalmente no disponible. Intenta de nuevo en unos minutos.',
          retryAfter: 60
        },
        { status: 503 }
      );
    }

    if (error.name === 'CircuitBreakerError') {
      return NextResponse.json(
        { 
          error: 'Servicio temporalmente no disponible',
          message: 'Demasiados errores recientes. Intenta de nuevo en unos minutos.',
          retryAfter: 30
        },
        { status: 503 }
      );
    }

    if (error.name === 'TimeoutError') {
      return NextResponse.json(
        { 
          error: 'Tiempo de respuesta agotado',
          message: 'La operación tardó demasiado. Intenta de nuevo.',
          retryAfter: 10
        },
        { status: 408 }
      );
    }

    // Error genérico
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        message: 'Ocurrió un error inesperado. Intenta de nuevo más tarde.'
      },
      { status: 500 }
    );
  }
}