import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql-direct';

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

    const heroImageQuery = `
      SELECT * FROM hero_images WHERE id = ?
    `;
    
    const heroImageResult = await executeQuery(heroImageQuery, [heroId]);

    if (!heroImageResult || heroImageResult.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Imagen de Hero no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: heroImageResult[0]
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

    // Verificar que la imagen existe
    const checkImageQuery = `
      SELECT id FROM hero_images WHERE id = ?
    `;
    
    const imageExists = await executeQuery(checkImageQuery, [heroId]);
    
    if (!imageExists || imageExists.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Imagen de Hero no encontrada' },
        { status: 404 }
      );
    }

    // Actualizar la imagen
    const updateQuery = `
      UPDATE hero_images 
      SET titulo = ?, subtitulo = ?, url_imagen = ?, cloudinary_id = ?, orden = ?, activo = ?, fecha_actualizacion = NOW()
      WHERE id = ?
    `;
    
    await executeQuery(updateQuery, [
      titulo,
      subtitulo || null,
      url_imagen,
      cloudinary_id || null,
      orden || 0,
      activo !== undefined ? activo : true,
      heroId
    ]);

    // Obtener la imagen actualizada
    const getImageQuery = `
      SELECT * FROM hero_images WHERE id = ?
    `;
    
    const heroImageResult = await executeQuery(getImageQuery, [heroId]);
    const heroImage = heroImageResult[0];

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

    // Verificar que la imagen existe
    const checkImageQuery = `
      SELECT id FROM hero_images WHERE id = ?
    `;
    
    const imageExists = await executeQuery(checkImageQuery, [heroId]);
    
    if (!imageExists || imageExists.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Imagen de Hero no encontrada' },
        { status: 404 }
      );
    }

    // Eliminar la imagen
    const deleteQuery = `
      DELETE FROM hero_images WHERE id = ?
    `;
    
    await executeQuery(deleteQuery, [heroId]);

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
