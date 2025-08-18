import { NextResponse } from 'next/server';
import { checkDatabaseHealth, forceReconnect } from '@/lib/db-utils';

export async function GET() {
  try {
    const health = await checkDatabaseHealth();
    
    // Si no está saludable, intentar reconectar
    if (!health.healthy) {
      try {
        await forceReconnect();
        const recheckHealth = await checkDatabaseHealth();
        return NextResponse.json({
          status: recheckHealth.healthy ? 'healthy' : 'unhealthy',
          database: recheckHealth,
          reconnected: true,
          timestamp: new Date().toISOString(),
          uptime: process.uptime()
        });
      } catch (reconnectError) {
        return NextResponse.json({
          status: 'unhealthy',
          database: health,
          reconnect_failed: true,
          reconnect_error: reconnectError.message,
          timestamp: new Date().toISOString(),
          uptime: process.uptime()
        });
      }
    }
    
    return NextResponse.json({
      status: 'healthy',
      database: health,
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
