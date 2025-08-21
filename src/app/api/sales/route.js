import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { executeWithRetry } from '@/lib/db-utils';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    console.log('📅 Filtros de fecha recibidos:', { start, end });

    let where = {};
    if (start || end) {
      where.fecha = {};
      
      if (start) {
        where.fecha.gte = new Date(start + 'T00:00:00.000Z');
      }
      
      if (end) {
        // Agregar un día completo hasta las 23:59:59
        const endDate = new Date(end + 'T23:59:59.999Z');
        where.fecha.lte = endDate;
      }
      
      console.log('🔍 Filtro de fecha aplicado:', where.fecha);
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
      total: parseFloat(s.total) || 0
    }));

    // Calcular el total de ventas del rango
    const totalVentasRango = formattedSales.reduce((sum, sale) => sum + sale.total, 0);
    
    console.log(`📊 Ventas encontradas: ${formattedSales.length}, Total: Q${totalVentasRango.toFixed(2)}`);

    return NextResponse.json({
      sales: formattedSales,
      summary: {
        totalVentas: totalVentasRango,
        totalPedidos: formattedSales.length,
        fechaInicio: start,
        fechaFin: end
      }
    });
  } catch (error) {
    console.error('Error obteniendo ventas:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
