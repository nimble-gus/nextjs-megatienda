import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const totalVentas = await prisma.ordenes.aggregate({ _sum: { total: true } });
    const totalPedidos = await prisma.ordenes.count();
    const totalClientes = await prisma.usuarios.count();

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
