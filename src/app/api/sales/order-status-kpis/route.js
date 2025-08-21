import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('🔄 Obteniendo KPIs de estados de pedidos...');

    // Contar pedidos pendientes (estado = 'pendiente')
    const pedidosPendientes = await prisma.ordenes.count({
      where: {
        estado: 'pendiente'
      }
    });

    // Contar pedidos contra entrega pendientes de enviar
    const contraEntregaPendientes = await prisma.ordenes.count({
      where: {
        metodo_pago: 'contra_entrega',
        estado: 'pendiente'
      }
    });

    // Contar pedidos con transferencia pendientes de validar
    const transferenciaPendientes = await prisma.ordenes.count({
      where: {
        metodo_pago: 'transferencia',
        estado: 'pendiente'
      }
    });

    const kpis = {
      pedidosPendientes,
      contraEntregaPendientes,
      transferenciaPendientes
    };

    console.log('✅ KPIs de estados de pedidos obtenidos:', kpis);

    return NextResponse.json({
      success: true,
      data: kpis
    });

  } catch (error) {
    console.error('❌ Error obteniendo KPIs de estados de pedidos:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error obteniendo KPIs de estados de pedidos',
      data: {
        pedidosPendientes: 0,
        contraEntregaPendientes: 0,
        transferenciaPendientes: 0
      }
    }, { status: 500 });
  }
}
