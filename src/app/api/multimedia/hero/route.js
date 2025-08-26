import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { executeWithRetry } from '@/lib/db-utils';
import { MultimediaCache } from '@/lib/redis';

// GET - Obtener imágenes de Hero activas para el frontend
export async function GET() {
  try {
    // Verificar caché Redis primero
    const cachedHeroImages = await MultimediaCache.getHeroImages();
    if (cachedHeroImages) {
      return NextResponse.json(cachedHeroImages);
    }
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
