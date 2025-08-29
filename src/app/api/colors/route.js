import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql-direct';

export async function GET() {
  try {
    const coloresQuery = `
      SELECT id, nombre, codigo_hex
      FROM colores
      ORDER BY nombre ASC
    `;
    
    const colores = await executeQuery(coloresQuery);
    return NextResponse.json(colores);
  } catch (error) {
    console.error('Error obteniendo colores:', error);
    return NextResponse.json({ 
      error: 'Error obteniendo colores',
      details: error.message 
    }, { status: 500 });
  }
}
