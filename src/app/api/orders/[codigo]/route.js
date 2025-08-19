import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    const { codigo } = params;

    if (!codigo) {
      return NextResponse.json(
        { error: 'Código de orden requerido' },
        { status: 400 }
      );
    }

    console.log('🔍 Buscando orden con código:', codigo);

    // Buscar la orden por código
    const orden = await prisma.ordenes.findUnique({
      where: { codigo_orden: codigo },
      include: {
        detalle: {
          include: {
            producto: true,
            color: true
          }
        }
      }
    });

    if (!orden) {
      console.log('❌ Orden no encontrada:', codigo);
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      );
    }

    console.log('✅ Orden encontrada:', orden.id);

    return NextResponse.json({
      success: true,
      orden: orden
    });

  } catch (error) {
    console.error('❌ Error obteniendo orden:', error);
    
    return NextResponse.json(
      { error: 'Error interno del servidor al obtener la orden' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
