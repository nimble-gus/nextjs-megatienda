import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql-direct';

export async function GET() {
  try {
    // Obtener rango de precios real
    const priceQuery = `
      SELECT 
        MIN(precio) as min_price,
        MAX(precio) as max_price
      FROM stock_detalle
      WHERE precio > 0
    `;
    
    // Obtener categorías con conteo de productos
    const categoriesQuery = `
      SELECT 
        c.id,
        c.nombre,
        COUNT(p.id) as productos_count
      FROM categorias c
      LEFT JOIN productos p ON c.id = p.categoria_id
      GROUP BY c.id, c.nombre
      ORDER BY c.nombre ASC
    `;
    
    // Obtener colores con conteo de productos
    const colorsQuery = `
      SELECT 
        co.id,
        co.nombre,
        co.codigo_hex,
        COUNT(DISTINCT s.producto_id) as productos_count
      FROM colores co
      LEFT JOIN stock_detalle s ON co.id = s.color_id
      GROUP BY co.id, co.nombre, co.codigo_hex
      ORDER BY co.nombre ASC
    `;

    // Ejecutar todas las consultas
    const [priceResult, categoriesResult, colorsResult] = await Promise.all([
      executeQuery(priceQuery),
      executeQuery(categoriesQuery),
      executeQuery(colorsQuery)
    ]);

    // Procesar resultados
    const priceRange = {
      min: priceResult[0]?.min_price || 0,
      max: priceResult[0]?.max_price || 1000
    };

    const categories = categoriesResult.map(cat => ({
      id: cat.id,
      name: cat.nombre,
      productCount: cat.productos_count
    }));

    const colors = colorsResult.map(color => ({
      id: color.id,
      name: color.nombre,
      hex: color.codigo_hex,
      productCount: color.productos_count
    }));

    return NextResponse.json({
      success: true,
      priceRange,
      categories,
      colors
    });

  } catch (error) {
    console.error('Error obteniendo filtros del catálogo:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    }, { status: 500 });
  }
}
