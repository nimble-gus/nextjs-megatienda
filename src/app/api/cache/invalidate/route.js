import { NextResponse } from 'next/server';
import { 
  invalidateProductRelatedCache, 
  invalidateFilterCache,
  invalidateAllCache,
  getCacheStats 
} from '@/lib/redis';

export async function POST(request) {
  try {
    const { type } = await request.json();
    
    console.log(`🔄 Invalidando caché tipo: ${type}`);
    
    switch (type) {
      case 'products':
        await invalidateProductRelatedCache();
        break;
      case 'filters':
        await invalidateFilterCache();
        break;
      case 'all':
        await invalidateAllCache();
        break;
      default:
        return NextResponse.json(
          { error: 'Tipo de invalidación no válido' },
          { status: 400 }
        );
    }
    
    const stats = await getCacheStats();
    return NextResponse.json({
      success: true,
      message: `Caché ${type} invalidado exitosamente`,
      stats
    });
    
  } catch (error) {
    console.error('Error invalidando caché:', error);
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
    console.error('Error obteniendo estadísticas del caché:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
