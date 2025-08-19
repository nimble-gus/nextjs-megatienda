import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { executeWithRetry } from '@/lib/db-utils';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    let where = {};
    if (start && end) {
      where.fecha = {
        gte: new Date(start),
        lte: new Date(end),
      };
    }

    const sales = await executeWithRetry(async () => {
      return await prisma.ordenes.findMany({
        where,
        include: {
          usuario: {
            select: { nombre: true }
          }
        },
        orderBy: { fecha: 'desc' }
      });
    });

    const formattedSales = sales.map(s => ({
      id: s.id,
      fecha: s.fecha,
      cliente: s.usuario?.nombre || s.nombre_cliente || 'Cliente no registrado',
      total: s.total
    }));

    return NextResponse.json(formattedSales);
  } catch (error) {
    console.error('Error obteniendo ventas:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
