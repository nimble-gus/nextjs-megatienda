import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { executeWithRetry } from '@/lib/db-utils';

// GET - Obtener un banner promocional específico
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const promoId = parseInt(id);

    if (isNaN(promoId)) {
      return NextResponse.json(
        { success: false, error: 'ID inválido' },
        { status: 400 }
      );
    }

    const promoBanner = await executeWithRetry(async () => {
      return await prisma.promo_banners.findUnique({
        where: { id: promoId }
      });
    });

    if (!promoBanner) {
      return NextResponse.json(
        { success: false, error: 'Banner promocional no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: promoBanner
    });
  } catch (error) {
    console.error('Error obteniendo banner promocional:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Actualizar un banner promocional
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const promoId = parseInt(id);
    const body = await request.json();
    const { titulo, descripcion, url_imagen, cloudinary_id, enlace, orden, activo } = body;

    if (isNaN(promoId)) {
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

    const promoBanner = await executeWithRetry(async () => {
      return await prisma.promo_banners.update({
        where: { id: promoId },
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
      message: 'Banner promocional actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error actualizando banner promocional:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar un banner promocional
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const promoId = parseInt(id);

    if (isNaN(promoId)) {
      return NextResponse.json(
        { success: false, error: 'ID inválido' },
        { status: 400 }
      );
    }

    await executeWithRetry(async () => {
      return await prisma.promo_banners.delete({
        where: { id: promoId }
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Banner promocional eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando banner promocional:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
