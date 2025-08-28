import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function GET(request) {
  try {
    // Obtener las cookies específicas del admin
    const adminAccessToken = request.cookies.get('adminAccessToken')?.value;
    const adminRefreshToken = request.cookies.get('adminRefreshToken')?.value;

    if (!adminAccessToken && !adminRefreshToken) {
      return NextResponse.json({
        isAuthenticated: false,
        user: null
      });
    }

    let userData = null;

    // Intentar verificar el access token primero
    if (adminAccessToken) {
      try {
        const { payload } = await jwtVerify(adminAccessToken, JWT_SECRET);
        userData = {
          id: payload.userId,
          email: payload.email,
          rol: payload.rol,
          nombre: payload.nombre
        };
      } catch (error) {
        console.log('Access token inválido, intentando refresh token');
      }
    }

    // Si no hay userData, intentar con refresh token
    if (!userData && adminRefreshToken) {
      try {
        const { payload } = await jwtVerify(adminRefreshToken, JWT_SECRET);
        
        // Verificar que el usuario existe y es admin
        const user = await prisma.usuarios.findUnique({
          where: { id: payload.userId }
        });

        if (user && user.rol === 'admin') {
          userData = {
            id: user.id,
            email: user.correo,
            rol: user.rol,
            nombre: user.nombre
          };
        }
      } catch (error) {
        console.log('Refresh token inválido');
      }
    }

    if (userData) {
      return NextResponse.json({
        isAuthenticated: true,
        user: userData
      });
    } else {
      return NextResponse.json({
        isAuthenticated: false,
        user: null
      });
    }

  } catch (error) {
    console.error('Error verificando estado de autenticación del admin:', error);
    return NextResponse.json({
      isAuthenticated: false,
      user: null
    });
  }
}

