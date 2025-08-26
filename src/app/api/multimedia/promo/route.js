import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { executeWithRetry } from '@/lib/db-utils';
import { MultimediaCache } from '@/lib/redis';

// GET - Obtener banners promocionales activos para el frontend
export async function GET() {
  try {
    // Verificar caché Redis primero
    const cachedPromoBanners = await MultimediaCache.getPromoBanners();
    if (cachedPromoBanners) {
      return NextResponse.json(cachedPromoBanners);
    }
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
