import { NextResponse } from 'next/server';
import { getQueueStats } from '@/lib/order-queue';

export async function GET(request) {
  try {
    const stats = getQueueStats();
    
    return NextResponse.json({
      success: true,
      stats: {
        ...stats,
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      }
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas de la cola:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { action } = await request.json();
    
    switch (action) {
      case 'clear':
        const { orderQueue } = await import('@/lib/order-queue');
        orderQueue.clearQueue();
        return NextResponse.json({
          success: true,
          message: 'Cola limpiada exitosamente'
        });
        
      case 'pause':
        const { orderQueue: pauseQueue } = await import('@/lib/order-queue');
        pauseQueue.pause();
        return NextResponse.json({
          success: true,
          message: 'Procesamiento pausado'
        });
        
      case 'resume':
        const { orderQueue: resumeQueue } = await import('@/lib/order-queue');
        resumeQueue.resume();
        return NextResponse.json({
          success: true,
          message: 'Procesamiento reanudado'
        });
        
      default:
        return NextResponse.json(
          { error: 'Acción no válida' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error ejecutando acción en la cola:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
