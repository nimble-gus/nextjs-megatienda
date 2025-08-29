import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql-direct';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    
    // Construir filtros de fecha para SQL
    let whereConditions = [];
    let queryParams = [];
    
    if (start) {
      whereConditions.push('o.fecha >= ?');
      queryParams.push(start + ' 00:00:00');
    }
    
    if (end) {
      whereConditions.push('o.fecha <= ?');
      queryParams.push(end + ' 23:59:59');
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Obtener ventas con filtros de fecha
    const salesQuery = `
      SELECT 
        o.id,
        o.fecha,
        o.total,
        o.nombre_cliente,
        u.nombre as usuario_nombre
      FROM ordenes o
      LEFT JOIN usuarios u ON o.usuario_id = u.id
      ${whereClause}
      ORDER BY o.fecha DESC
    `;
    
    const sales = await executeQuery(salesQuery, queryParams);

    const formattedSales = sales.map(s => ({
      id: s.id,
      fecha: s.fecha,
      cliente: s.usuario_nombre || s.nombre_cliente || 'Cliente no registrado',
      total: parseFloat(s.total) || 0
    }));

    // Calcular el total de ventas del rango
    const totalVentasRango = formattedSales.reduce((sum, sale) => sum + sale.total, 0);

    const responseData = {
      sales: formattedSales,
      summary: {
        totalVentas: totalVentasRango,
        totalPedidos: formattedSales.length,
        fechaInicio: start,
        fechaFin: end
      }
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error obteniendo ventas:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
