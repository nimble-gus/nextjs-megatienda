import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { executeWithRetry } from '@/lib/db-utils';

export async function GET() {
  try {
    const [totalVentas, totalPedidos, totalClientes] = await executeWithRetry(async () => {
      const ventas = await prisma.ordenes.aggregate({ _sum: { total: true } });
      const pedidos = await prisma.ordenes.count();
      const clientes = await prisma.usuarios.count();
      return [ventas, pedidos, clientes];
    });

    return NextResponse.json({
      totalVentas: totalVentas._sum.total || 0,
      totalPedidos,
      totalClientes
    });
  } catch (error) {
    console.error('Error obteniendo KPIs:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
