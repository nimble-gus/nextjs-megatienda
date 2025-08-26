import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { KPICache } from '@/lib/redis';

export async function GET() {
  try {
    // Verificar caché Redis primero
    const cachedKPIs = await KPICache.get();
    if (cachedKPIs) {
      return NextResponse.json(cachedKPIs);
    }

    // Consultas simples y directas
    const pedidos = await prisma.ordenes.count();
    const clientes = await prisma.usuarios.count();
    
    // Para ventas totales, usar una consulta más simple
    const ventasResult = await prisma.$queryRaw`SELECT COALESCE(SUM(total), 0) as total FROM ordenes`;
    const totalVentas = parseFloat(ventasResult[0].total) || 0;

    const responseData = {
      totalVentas: totalVentas,
      totalPedidos: pedidos,
      totalClientes: clientes
    };

    // Almacenar en caché Redis para futuras consultas
    await KPICache.set(responseData);
    
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
