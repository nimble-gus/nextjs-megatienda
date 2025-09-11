import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql-direct';

export async function GET() {
  try {
    console.log('🔍 Verificando estado de órdenes en la base de datos...');
    
    // Obtener todas las órdenes
    const ordersQuery = `
      SELECT 
        id,
        codigo_orden,
        estado,
        fecha,
        total,
        nombre_cliente,
        metodo_pago
      FROM ordenes 
      ORDER BY fecha DESC
      LIMIT 10
    `;
    
    const orders = await executeQuery(ordersQuery);
    
    console.log('📋 Órdenes encontradas:', orders.length);
    orders.forEach(order => {
      console.log(`  - ID: ${order.id}, Código: ${order.codigo_orden}, Estado: ${order.estado}, Cliente: ${order.nombre_cliente}`);
    });
    
    // Contar por estado
    const statusCountQuery = `
      SELECT 
        estado,
        COUNT(*) as count
      FROM ordenes 
      GROUP BY estado
      ORDER BY count DESC
    `;
    
    const statusCounts = await executeQuery(statusCountQuery);
    
    console.log('📊 Conteo por estado:');
    statusCounts.forEach(status => {
      console.log(`  - ${status.estado}: ${status.count} órdenes`);
    });
    
    return NextResponse.json({
      success: true,
      message: 'Estado de órdenes verificado',
      data: {
        totalOrders: orders.length,
        orders: orders,
        statusCounts: statusCounts
      }
    });
    
  } catch (error) {
    console.error('❌ Error verificando órdenes:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error verificando órdenes', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
