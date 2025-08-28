import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';

export async function GET(request) {
  try {
    // Verificar autenticación de admin
    const adminToken = request.cookies.get('adminAccessToken')?.value;
    
    if (!adminToken) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar el token JWT
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(adminToken, secret);
    
    // Verificar que sea un admin
    if (payload.rol !== 'admin') {
      return NextResponse.json(
        { error: 'Acceso denegado' },
        { status: 403 }
      );
    }

    // Contar órdenes pendientes
    const pendingCount = await prisma.ordenes.count({
      where: {
        estado: {
          in: ['pendiente', 'nuevo', 'procesando']
        }
      }
    });

    

    return NextResponse.json({
      pendingCount,
      success: true
    });

  } catch (error) {
    console.error('Error obteniendo conteo de órdenes pendientes:', error);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        pendingCount: 0
      },
      { status: 500 }
    );
  }
}
