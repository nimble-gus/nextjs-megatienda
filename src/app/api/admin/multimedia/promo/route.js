import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql-direct';

// GET - Obtener todos los banners promocionales
export async function GET() {
  try {
    const promoBannersQuery = `
      SELECT * FROM promo_banners
      ORDER BY orden ASC
    `;
    
    const promoBanners = await executeQuery(promoBannersQuery);

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

    const insertQuery = `
      INSERT INTO promo_banners (titulo, descripcion, url_imagen, cloudinary_id, enlace, orden, activo, fecha_actualizacion)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    
    const result = await executeQuery(insertQuery, [
      titulo,
      descripcion || null,
      url_imagen,
      cloudinary_id || null,
      enlace || null,
      orden || 0,
      activo !== undefined ? activo : true
    ]);
    
    // Obtener el banner creado
    const getBannerQuery = `
      SELECT * FROM promo_banners WHERE id = ?
    `;
    
    const promoBannerResult = await executeQuery(getBannerQuery, [result.insertId]);
    const promoBanner = promoBannerResult[0];

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

// PUT - Actualizar un banner promocional
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, titulo, descripcion, url_imagen, cloudinary_id, enlace, orden, activo } = body;

    // Validar campos requeridos
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID es requerido' },
        { status: 400 }
      );
    }

    // Verificar que el banner existe
    const checkBannerQuery = `
      SELECT id FROM promo_banners WHERE id = ?
    `;
    
    const bannerExists = await executeQuery(checkBannerQuery, [id]);
    
    if (!bannerExists || bannerExists.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Banner no encontrado' },
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
    
    if (descripcion !== undefined) {
      updateFields.push('descripcion = ?');
      updateValues.push(descripcion);
    }
    
    if (url_imagen !== undefined) {
      updateFields.push('url_imagen = ?');
      updateValues.push(url_imagen);
    }
    
    if (cloudinary_id !== undefined) {
      updateFields.push('cloudinary_id = ?');
      updateValues.push(cloudinary_id);
    }
    
    if (enlace !== undefined) {
      updateFields.push('enlace = ?');
      updateValues.push(enlace);
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
        UPDATE promo_banners 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `;
      
      await executeQuery(updateQuery, updateValues);
    }
    
    // Obtener el banner actualizado
    const getBannerQuery = `
      SELECT * FROM promo_banners WHERE id = ?
    `;
    
    const promoBannerResult = await executeQuery(getBannerQuery, [id]);
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
