import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql-direct';

export async function GET() {
  try {
    // Consultas simples y directas usando MySQL
    const pedidosQuery = `SELECT COUNT(*) as count FROM ordenes`;
    const clientesQuery = `SELECT COUNT(*) as count FROM usuarios`;
    const ventasQuery = `SELECT COALESCE(SUM(total), 0) as total FROM ordenes`;
    
    // Ejecutar todas las consultas en paralelo
    const [pedidosResult, clientesResult, ventasResult] = await Promise.all([
      executeQuery(pedidosQuery),
      executeQuery(clientesQuery),
      executeQuery(ventasQuery)
    ]);
    
    const totalPedidos = pedidosResult[0].count;
    const totalClientes = clientesResult[0].count;
    const totalVentas = parseFloat(ventasResult[0].total) || 0;

    const responseData = {
      totalVentas: totalVentas,
      totalPedidos: totalPedidos,
      totalClientes: totalClientes
    };
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('❌ Error obteniendo KPIs:', error);
    
    // Retornar valores por defecto en caso de error
    return NextResponse.json({
      totalVentas: 0,
      totalPedidos: 0,
      totalClientes: 0,
      error: 'Error al cargar estadísticas'
    }, { status: 500 });
  }
}
