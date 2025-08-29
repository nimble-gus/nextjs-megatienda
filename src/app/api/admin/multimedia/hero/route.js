import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql-direct';

// GET - Obtener todas las imágenes de Hero
export async function GET() {
  try {
    const heroImagesQuery = `
      SELECT * FROM hero_images
      ORDER BY orden ASC
    `;
    
    const heroImages = await executeQuery(heroImagesQuery);

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

    const insertQuery = `
      INSERT INTO hero_images (titulo, subtitulo, url_imagen, cloudinary_id, orden, activo, fecha_actualizacion)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;
    
    const result = await executeQuery(insertQuery, [
      titulo,
      subtitulo || null,
      url_imagen,
      cloudinary_id || null,
      orden || 0,
      activo !== undefined ? activo : true
    ]);
    
    // Obtener la imagen creada
    const getImageQuery = `
      SELECT * FROM hero_images WHERE id = ?
    `;
    
    const heroImageResult = await executeQuery(getImageQuery, [result.insertId]);
    const heroImage = heroImageResult[0];

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

// PUT - Actualizar una imagen de Hero
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, titulo, subtitulo, url_imagen, cloudinary_id, orden, activo } = body;

    // Validar campos requeridos
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID es requerido' },
        { status: 400 }
      );
    }

    // Verificar que la imagen existe
    const checkImageQuery = `
      SELECT id FROM hero_images WHERE id = ?
    `;
    
    const imageExists = await executeQuery(checkImageQuery, [id]);
    
    if (!imageExists || imageExists.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Imagen no encontrada' },
        { status: 404 }
      );
    }

    // Construir la consulta de actualización
    let updateFields = [];
    let updateValues = [];
    
    if (titulo !== undefined) {
      updateFields.push('titulo = ?');
      updateValues.push(titulo);
    }
    
    if (subtitulo !== undefined) {
      updateFields.push('subtitulo = ?');
      updateValues.push(subtitulo);
    }
    
    if (url_imagen !== undefined) {
      updateFields.push('url_imagen = ?');
      updateValues.push(url_imagen);
    }
    
    if (cloudinary_id !== undefined) {
      updateFields.push('cloudinary_id = ?');
      updateValues.push(cloudinary_id);
    }
    
    if (orden !== undefined) {
      updateFields.push('orden = ?');
      updateValues.push(orden);
    }
    
    if (activo !== undefined) {
      updateFields.push('activo = ?');
      updateValues.push(activo);
    }
    
    // Agregar fecha de actualización
    updateFields.push('fecha_actualizacion = NOW()');
    
    if (updateFields.length > 0) {
      updateValues.push(id);
      const updateQuery = `
        UPDATE hero_images 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `;
      
      await executeQuery(updateQuery, updateValues);
    }
    
    // Obtener la imagen actualizada
    const getImageQuery = `
      SELECT * FROM hero_images WHERE id = ?
    `;
    
    const heroImageResult = await executeQuery(getImageQuery, [id]);
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
