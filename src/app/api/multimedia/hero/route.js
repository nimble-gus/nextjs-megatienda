import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { executeWithRetry } from '@/lib/db-utils';
import { MultimediaCache } from '@/lib/redis';

// GET - Obtener imágenes de Hero activas para el frontend
export async function GET() {
  try {
    console.log('=== API /api/multimedia/hero iniciada ===');
    
    // Verificar caché Redis primero
    const cachedHeroImages = await MultimediaCache.getHeroImages();
    if (cachedHeroImages) {
      console.log('✅ Hero images obtenidas del caché Redis');
      return NextResponse.json(cachedHeroImages);
    }
    
    console.log('🔄 Hero images no encontradas en caché, consultando base de datos...');
    
    const heroImages = await executeWithRetry(async () => {
      return await prisma.hero_images.findMany({
        where: {
          activo: true
        },
        orderBy: {
          orden: 'asc'
        }
      });
    });

    console.log(`✅ Hero images encontradas: ${heroImages.length}`);
    
    const responseData = {
      success: true,
      data: heroImages
    };
    
    // Almacenar en caché Redis
    await MultimediaCache.setHeroImages(responseData);
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error obteniendo imágenes de Hero:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
