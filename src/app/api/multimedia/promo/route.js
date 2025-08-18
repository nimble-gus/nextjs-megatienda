import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { executeWithRetry } from '@/lib/db-utils';
import { MultimediaCache } from '@/lib/redis';

// GET - Obtener banners promocionales activos para el frontend
export async function GET() {
  try {
    console.log('=== API /api/multimedia/promo iniciada ===');
    
    // Verificar caché Redis primero
    const cachedPromoBanners = await MultimediaCache.getPromoBanners();
    if (cachedPromoBanners) {
      console.log('✅ Promo banners obtenidos del caché Redis');
      return NextResponse.json(cachedPromoBanners);
    }
    
    console.log('🔄 Promo banners no encontrados en caché, consultando base de datos...');
    
    const promoBanners = await executeWithRetry(async () => {
      return await prisma.promo_banners.findMany({
        where: {
          activo: true
        },
        orderBy: {
          orden: 'asc'
        }
      });
    });

    console.log(`✅ Promo banners encontrados: ${promoBanners.length}`);
    
    const responseData = {
      success: true,
      data: promoBanners
    };
    
    // Almacenar en caché Redis
    await MultimediaCache.setPromoBanners(responseData);
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error obteniendo banners promocionales:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
