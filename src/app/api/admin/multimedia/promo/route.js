import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma-production';
import { executeWithRetry } from '@/lib/db-utils';

// GET - Obtener todos los banners promocionales
export async function GET() {
  try {
    const promoBanners = await executeWithRetry(async () => {
      return await prisma.promo_banners.findMany({
        orderBy: {
          orden: 'asc'
        }
      });
    });

    return NextResponse.json({
      success: true,
      data: promoBanners
    });
  } catch (error) {
    console.error('Error obteniendo banners promocionales:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Crear un nuevo banner promocional
export async function POST(request) {
  try {
    const body = await request.json();
    const { titulo, descripcion, url_imagen, cloudinary_id, enlace, orden, activo } = body;

    // Validar campos requeridos
    if (!titulo || !url_imagen) {
      return NextResponse.json(
        { success: false, error: 'Título y URL de imagen son requeridos' },
        { status: 400 }
      );
    }

    const promoBanner = await executeWithRetry(async () => {
      return await prisma.promo_banners.create({
        data: {
          titulo,
          descripcion: descripcion || null,
          url_imagen,
          cloudinary_id: cloudinary_id || null,
          enlace: enlace || null,
          orden: orden || 0,
          activo: activo !== undefined ? activo : true,
          fecha_actualizacion: new Date()
        }
      });
    });

    return NextResponse.json({
      success: true,
      data: promoBanner,
      message: 'Banner promocional creado exitosamente'
    });
  } catch (error) {
    console.error('Error creando banner promocional:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
