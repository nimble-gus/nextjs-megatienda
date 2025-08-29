import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql-direct';

export async function GET() {
  try {
    const results = {};

    // Prueba 1: Sin parámetros
    console.log('=== PRUEBA 1: Sin parámetros ===');
    try {
      const query1 = 'SELECT COUNT(*) as total FROM productos';
      results.test1 = await executeQuery(query1);
      console.log('✅ Prueba 1 exitosa');
    } catch (error) {
      results.test1 = { error: error.message };
      console.log('❌ Prueba 1 falló:', error.message);
    }

    // Prueba 2: Con parámetros como strings
    console.log('=== PRUEBA 2: Parámetros como strings ===');
    try {
      const query2 = 'SELECT * FROM productos LIMIT ? OFFSET ?';
      results.test2 = await executeQuery(query2, ['5', '0']);
      console.log('✅ Prueba 2 exitosa');
    } catch (error) {
      results.test2 = { error: error.message };
      console.log('❌ Prueba 2 falló:', error.message);
    }

    // Prueba 3: Con parámetros como números
    console.log('=== PRUEBA 3: Parámetros como números ===');
    try {
      const query3 = 'SELECT * FROM productos LIMIT ? OFFSET ?';
      results.test3 = await executeQuery(query3, [5, 0]);
      console.log('✅ Prueba 3 exitosa');
    } catch (error) {
      results.test3 = { error: error.message };
      console.log('❌ Prueba 3 falló:', error.message);
    }

    // Prueba 4: Con parámetros usando parseInt
    console.log('=== PRUEBA 4: Parámetros con parseInt ===');
    try {
      const query4 = 'SELECT * FROM productos LIMIT ? OFFSET ?';
      results.test4 = await executeQuery(query4, [parseInt(5), parseInt(0)]);
      console.log('✅ Prueba 4 exitosa');
    } catch (error) {
      results.test4 = { error: error.message };
      console.log('❌ Prueba 4 falló:', error.message);
    }

    // Prueba 5: Sin LIMIT/OFFSET, solo JOIN
    console.log('=== PRUEBA 5: Solo JOIN sin parámetros ===');
    try {
      const query5 = `
        SELECT 
          p.id,
          p.nombre,
          c.nombre as categoria_nombre
        FROM productos p
        LEFT JOIN categorias c ON p.categoria_id = c.id
      `;
      results.test5 = await executeQuery(query5);
      console.log('✅ Prueba 5 exitosa');
    } catch (error) {
      results.test5 = { error: error.message };
      console.log('❌ Prueba 5 falló:', error.message);
    }

    // Prueba 6: Con LIMIT hardcodeado
    console.log('=== PRUEBA 6: LIMIT hardcodeado ===');
    try {
      const query6 = `
        SELECT 
          p.id,
          p.nombre,
          c.nombre as categoria_nombre
        FROM productos p
        LEFT JOIN categorias c ON p.categoria_id = c.id
        LIMIT 5
      `;
      results.test6 = await executeQuery(query6);
      console.log('✅ Prueba 6 exitosa');
    } catch (error) {
      results.test6 = { error: error.message };
      console.log('❌ Prueba 6 falló:', error.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Pruebas de parámetros completadas',
      results
    });

  } catch (error) {
    console.error('=== ERROR GENERAL ===');
    console.error('Error completo:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error general',
      details: error.message
    }, { status: 500 });
  }
}
