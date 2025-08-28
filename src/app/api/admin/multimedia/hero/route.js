import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma-production';
import { executeWithRetry } from '@/lib/db-utils';

// GET - Obtener todas las imágenes de Hero
export async function GET() {
  try {
    const heroImages = await executeWithRetry(async () => {
      return await prisma.hero_images.findMany({
        orderBy: {
          orden: 'asc'
        }
      });
    });

    return NextResponse.json({
      success: true,
      data: heroImages
    });
  } catch (error) {
    console.error('Error obteniendo imágenes de Hero:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Crear una nueva imagen de Hero
export async function POST(request) {
  try {
    const body = await request.json();
    const { titulo, subtitulo, url_imagen, cloudinary_id, orden, activo } = body;

    // Validar campos requeridos
    if (!titulo || !url_imagen) {
      return NextResponse.json(
        { success: false, error: 'Título y URL de imagen son requeridos' },
        { status: 400 }
      );
    }

    const heroImage = await executeWithRetry(async () => {
      return await prisma.hero_images.create({
        data: {
          titulo,
          subtitulo: subtitulo || null,
          url_imagen,
          cloudinary_id: cloudinary_id || null,
          orden: orden || 0,
          activo: activo !== undefined ? activo : true,
          fecha_actualizacion: new Date()
        }
      });
    });

    return NextResponse.json({
      success: true,
      data: heroImage,
      message: 'Imagen de Hero creada exitosamente'
    });
  } catch (error) {
    console.error('Error creando imagen de Hero:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
