import { NextResponse } from 'next/server';
import { clearAllCache, getCacheStats } from '@/lib/home-cache';

export async function POST(request) {
  try {
    const { type } = await request.json();
    switch (type) {
      case 'all':
        clearAllCache();
        break;
      case 'categories':
        // Importar dinámicamente para evitar problemas de circular dependency
        const { CategoriesCache } = await import('@/lib/home-cache');
        CategoriesCache.invalidate();
        break;
      case 'filters':
        const { FiltersCache } = await import('@/lib/home-cache');
        FiltersCache.invalidate();
        break;
      case 'featured_products':
        const { FeaturedProductsCache } = await import('@/lib/home-cache');
        FeaturedProductsCache.invalidate();
        break;
      default:
        return NextResponse.json(
          { error: 'Tipo de caché no válido' },
          { status: 400 }
        );
    }
    
    const stats = getCacheStats();
    
    return NextResponse.json({
      success: true,
      message: `Caché ${type} invalidado correctamente`,
      stats
    });
    
  } catch (error) {
    console.error('❌ Error invalidando caché:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const stats = getCacheStats();
    
    return NextResponse.json({
      success: true,
      stats
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas de caché:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
