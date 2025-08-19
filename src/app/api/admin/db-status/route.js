import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { executeWithRetry } from '@/lib/db-utils';

export async function GET() {
  try {
    console.log('🔍 Verificando estado de la base de datos...');
    
    // Intentar una consulta simple para verificar la conexión
    const result = await executeWithRetry(async () => {
      const testQuery = await prisma.$queryRaw`SELECT 1 as test`;
      return testQuery;
    });
    
    console.log('✅ Conexión a la base de datos exitosa');
    
    return NextResponse.json({
      success: true,
      status: 'connected',
      message: 'Conexión a la base de datos establecida',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error verificando conexión a la base de datos:', error);
    
    return NextResponse.json({
      success: false,
      status: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
