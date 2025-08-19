import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { executeWithRetry } from '@/lib/db-utils';

export async function GET() {
  try {
    console.log('📊 Iniciando consulta de KPIs...');
    
    // Ejecutar consultas por separado para mejor debugging
    const [totalVentas, totalPedidos, totalClientes] = await executeWithRetry(async () => {
      console.log('🔍 Ejecutando consultas de KPIs...');
      
      try {
        // Consulta de ventas totales - simplificada
        console.log('🔍 Consultando ventas totales...');
        const ventas = await prisma.ordenes.aggregate({ 
          _sum: { total: true }
        });
        console.log('✅ Ventas obtenidas:', ventas);
        
        // Consulta de pedidos totales
        console.log('🔍 Consultando pedidos totales...');
        const pedidos = await prisma.ordenes.count();
        console.log('✅ Pedidos obtenidos:', pedidos);
        
        // Consulta de clientes registrados
        console.log('🔍 Consultando clientes totales...');
        const clientes = await prisma.usuarios.count();
        console.log('✅ Clientes obtenidos:', clientes);
        
        return [ventas, pedidos, clientes];
      } catch (dbError) {
        console.error('❌ Error en consultas de base de datos:', dbError);
        throw dbError;
      }
    });

    const response = {
      totalVentas: totalVentas._sum.total || 0,
      totalPedidos,
      totalClientes
    };

    console.log('📊 KPIs finales:', response);
    return NextResponse.json(response);
    
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
