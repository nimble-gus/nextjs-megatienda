import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql-direct';

export async function GET() {
  try {
    // Prueba 1: Consulta básica sin parámetros
    console.log('=== PRUEBA 1: Consulta básica sin parámetros ===');
    const basicQuery = 'SELECT COUNT(*) as total FROM productos';
    const basicResult = await executeQuery(basicQuery);
    console.log('Resultado básico:', basicResult);

    // Prueba 2: Consulta con JOIN simple
    console.log('=== PRUEBA 2: Consulta con JOIN simple ===');
    const joinQuery = `
      SELECT 
        p.id,
        p.nombre,
        c.nombre as categoria_nombre
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      LIMIT 5
    `;
    const joinResult = await executeQuery(joinQuery);
    console.log('Resultado JOIN:', joinResult);

    // Prueba 3: Consulta con parámetros simples
    console.log('=== PRUEBA 3: Consulta con parámetros simples ===');
    const paramQuery = 'SELECT * FROM productos LIMIT ? OFFSET ?';
    const paramResult = await executeQuery(paramQuery, [5, 0]);
    console.log('Resultado parámetros:', paramResult);

    // Prueba 4: Consulta exacta del catálogo
    console.log('=== PRUEBA 4: Consulta exacta del catálogo ===');
    const catalogQuery = `
      SELECT 
        p.id,
        p.sku,
        p.nombre,
        p.descripcion,
        p.url_imagen,
        p.featured,
        p.categoria_id,
        c.nombre as categoria_nombre,
        0 as precio_min,
        0 as precio_max,
        0 as stock_total
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      ORDER BY p.id DESC
      LIMIT ? OFFSET ?
    `;
    const catalogResult = await executeQuery(catalogQuery, [12, 0]);
    console.log('Resultado catálogo:', catalogResult);

    return NextResponse.json({
      success: true,
      message: 'Diagnóstico completado',
      results: {
        basic: basicResult,
        join: joinResult,
        params: paramResult,
        catalog: catalogResult
      }
    });

  } catch (error) {
    console.error('=== ERROR EN DIAGNÓSTICO ===');
    console.error('Error completo:', error);
    console.error('Stack trace:', error.stack);
    
    return NextResponse.json({
      success: false,
      error: 'Error en diagnóstico',
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
