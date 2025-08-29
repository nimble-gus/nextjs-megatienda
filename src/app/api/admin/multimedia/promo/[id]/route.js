import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql-direct';

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

    const promoBannerQuery = `
      SELECT * FROM promo_banners WHERE id = ?
    `;
    
    const promoBannerResult = await executeQuery(promoBannerQuery, [promoId]);

    if (!promoBannerResult || promoBannerResult.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Banner promocional no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: promoBannerResult[0]
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

    // Verificar que el banner existe
    const checkBannerQuery = `
      SELECT id FROM promo_banners WHERE id = ?
    `;
    
    const bannerExists = await executeQuery(checkBannerQuery, [promoId]);
    
    if (!bannerExists || bannerExists.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Banner promocional no encontrado' },
        { status: 404 }
      );
    }

    // Actualizar el banner
    const updateQuery = `
      UPDATE promo_banners 
      SET titulo = ?, descripcion = ?, url_imagen = ?, cloudinary_id = ?, enlace = ?, orden = ?, activo = ?, fecha_actualizacion = NOW()
      WHERE id = ?
    `;
    
    await executeQuery(updateQuery, [
      titulo,
      descripcion || null,
      url_imagen,
      cloudinary_id || null,
      enlace || null,
      orden || 0,
      activo !== undefined ? activo : true,
      promoId
    ]);

    // Obtener el banner actualizado
    const getBannerQuery = `
      SELECT * FROM promo_banners WHERE id = ?
    `;
    
    const promoBannerResult = await executeQuery(getBannerQuery, [promoId]);
    const promoBanner = promoBannerResult[0];

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

    // Verificar que el banner existe
    const checkBannerQuery = `
      SELECT id FROM promo_banners WHERE id = ?
    `;
    
    const bannerExists = await executeQuery(checkBannerQuery, [promoId]);
    
    if (!bannerExists || bannerExists.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Banner promocional no encontrado' },
        { status: 404 }
      );
    }

    // Eliminar el banner
    const deleteQuery = `
      DELETE FROM promo_banners WHERE id = ?
    `;
    
    await executeQuery(deleteQuery, [promoId]);

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
