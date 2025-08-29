import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql-direct';

export async function GET() {
  try {
    // Contar pedidos pendientes (estado = 'pendiente')
    const pedidosPendientesQuery = `
      SELECT COUNT(*) as count 
      FROM ordenes 
      WHERE estado = 'pendiente'
    `;

    // Contar pedidos contra entrega pendientes de enviar
    const contraEntregaPendientesQuery = `
      SELECT COUNT(*) as count 
      FROM ordenes 
      WHERE metodo_pago = 'contra_entrega' AND estado = 'pendiente'
    `;

    // Contar pedidos con transferencia pendientes de validar
    const transferenciaPendientesQuery = `
      SELECT COUNT(*) as count 
      FROM ordenes 
      WHERE metodo_pago = 'transferencia' AND estado = 'pendiente'
    `;

    // Ejecutar todas las consultas en paralelo
    const [pedidosPendientesResult, contraEntregaResult, transferenciaResult] = await Promise.all([
      executeQuery(pedidosPendientesQuery),
      executeQuery(contraEntregaPendientesQuery),
      executeQuery(transferenciaPendientesQuery)
    ]);

    const kpis = {
      pedidosPendientes: pedidosPendientesResult[0].count,
      contraEntregaPendientes: contraEntregaResult[0].count,
      transferenciaPendientes: transferenciaResult[0].count
    };
    
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
