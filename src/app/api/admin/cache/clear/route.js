import { NextResponse } from 'next/server';
import { 
  invalidateProductCache, 
  invalidateOrderCache, 
  invalidateMultimediaCache, 
  invalidateAllCache,
  getCacheStats,
  cleanupExpiredCache 
} from '@/lib/cache-manager';

export async function POST(request) {
  try {
    const { type } = await request.json();
    
    let message = '';
    let stats = null;
    
    switch (type) {
      case 'products':
        await invalidateProductCache();
        message = 'Caché de productos limpiado exitosamente';
        break;
        
      case 'orders':
        await invalidateOrderCache();
        message = 'Caché de órdenes limpiado exitosamente';
        break;
        
      case 'multimedia':
        await invalidateMultimediaCache();
        message = 'Caché de multimedia limpiado exitosamente';
        break;
        
      case 'all':
        await invalidateAllCache();
        message = 'Todo el caché limpiado exitosamente';
        break;
        
      case 'expired':
        await cleanupExpiredCache();
        message = 'Caché expirado limpiado exitosamente';
        break;
        
      default:
        return NextResponse.json(
          { error: 'Tipo de caché no válido' },
          { status: 400 }
        );
    }
    
    // Obtener estadísticas actualizadas
    stats = await getCacheStats();
    
    return NextResponse.json({
      success: true,
      message,
      stats
    });
    
  } catch (error) {
    console.error('❌ Error limpiando caché:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const stats = await getCacheStats();
    
    return NextResponse.json({
      success: true,
      stats
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas del caché:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
