import { NextResponse } from 'next/server';
import { queryQueue } from '@/lib/query-queue.js';
import { checkDatabaseHealth } from '@/lib/db-utils.js';
import { getCacheStats } from '@/lib/home-cache.js';

export async function GET() {
  try {
    // Verificar estado de la base de datos
    const dbHealth = await checkDatabaseHealth();
    
    // Obtener estadísticas de la cola
    const queueStats = queryQueue.stats;
    
    // Obtener estadísticas del caché
    const cacheStats = getCacheStats();
    
    // Estado general del sistema
    const systemStatus = {
      timestamp: new Date().toISOString(),
      database: {
        healthy: dbHealth.healthy,
        message: dbHealth.message,
        code: dbHealth.code
      },
      queue: {
        ...queueStats,
        healthy: queueStats.activeQueries < queueStats.maxConcurrent
      },
      cache: {
        ...cacheStats,
        healthy: cacheStats.size > 0
      },
      overall: {
        healthy: dbHealth.healthy && queueStats.activeQueries < queueStats.maxConcurrent,
        message: dbHealth.healthy ? 'Sistema funcionando correctamente' : 'Problemas detectados'
      }
    };
    
    return NextResponse.json({
      success: true,
      status: systemStatus
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo estado del sistema:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor',
        details: error.message
      },
      { status: 500 }
    );
  }
}
