import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma-production';
import { executeWithRetry } from '@/lib/db-utils';

// GET - Obtener una imagen de Hero específica
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const heroId = parseInt(id);

    if (isNaN(heroId)) {
      return NextResponse.json(
        { success: false, error: 'ID inválido' },
        { status: 400 }
      );
    }

    const heroImage = await executeWithRetry(async () => {
      return await prisma.hero_images.findUnique({
        where: { id: heroId }
      });
    });

    if (!heroImage) {
      return NextResponse.json(
        { success: false, error: 'Imagen de Hero no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: heroImage
    });
  } catch (error) {
    console.error('Error obteniendo imagen de Hero:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Actualizar una imagen de Hero
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const heroId = parseInt(id);
    const body = await request.json();
    const { titulo, subtitulo, url_imagen, cloudinary_id, orden, activo } = body;

    if (isNaN(heroId)) {
      return NextResponse.json(
        { success: false, error: 'ID inválido' },
        { status: 400 }
      );
    }

    // Validar campos requeridos
    if (!titulo || !url_imagen) {
      return NextResponse.json(
        { success: false, error: 'Título y URL de imagen son requeridos' },
        { status: 400 }
      );
    }

    const heroImage = await executeWithRetry(async () => {
      return await prisma.hero_images.update({
        where: { id: heroId },
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
      message: 'Imagen de Hero actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error actualizando imagen de Hero:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar una imagen de Hero
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const heroId = parseInt(id);

    if (isNaN(heroId)) {
      return NextResponse.json(
        { success: false, error: 'ID inválido' },
        { status: 400 }
      );
    }

    await executeWithRetry(async () => {
      return await prisma.hero_images.delete({
        where: { id: heroId }
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Imagen de Hero eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando imagen de Hero:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
