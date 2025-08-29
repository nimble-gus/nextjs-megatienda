import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql-direct';

// GET - Obtener imágenes de un producto
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const imagesQuery = `
      SELECT id, producto_id, url_imagen
      FROM imagenes_producto
      WHERE producto_id = ?
      ORDER BY id ASC
    `;
    
    const images = await executeQuery(imagesQuery, [id]);

    return NextResponse.json(images);
  } catch (error) {
    console.error('Error obteniendo imágenes:', error);
    return NextResponse.json(
      { error: 'Error al obtener las imágenes del producto' },
      { status: 500 }
    );
  }
}

// POST - Agregar nueva imagen a un producto
export async function POST(request, { params }) {
  try {
    const { id } = params;
    const { url_imagen } = await request.json();
    
    if (!url_imagen || url_imagen.trim() === '') {
      return NextResponse.json(
        { error: 'URL de imagen es requerida' },
        { status: 400 }
      );
    }

    const insertQuery = `
      INSERT INTO imagenes_producto (producto_id, url_imagen)
      VALUES (?, ?)
    `;
    
    const result = await executeQuery(insertQuery, [id, url_imagen.trim()]);
    
    // Obtener la imagen creada
    const newImageQuery = `
      SELECT id, producto_id, url_imagen
      FROM imagenes_producto
      WHERE id = ?
    `;
    
    const newImageResult = await executeQuery(newImageQuery, [result.insertId]);
    const newImage = newImageResult[0];
    
    return NextResponse.json({ 
      success: true, 
      message: 'Imagen agregada exitosamente',
      image: newImage
    });
  } catch (error) {
    console.error('Error agregando imagen:', error);
    return NextResponse.json(
      { error: 'Error al agregar la imagen' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar una imagen específica
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get('imageId');
    
    if (!imageId) {
      return NextResponse.json(
        { error: 'ID de imagen es requerido' },
        { status: 400 }
      );
    }
    
    // Verificar que la imagen existe y pertenece al producto
    const checkImageQuery = `
      SELECT id FROM imagenes_producto 
      WHERE id = ? AND producto_id = ?
    `;
    
    const imageExists = await executeQuery(checkImageQuery, [imageId, id]);
    
    if (!imageExists || imageExists.length === 0) {
      return NextResponse.json(
        { error: 'Imagen no encontrada' },
        { status: 404 }
      );
    }
    
    // Eliminar la imagen
    const deleteQuery = `
      DELETE FROM imagenes_producto 
      WHERE id = ? AND producto_id = ?
    `;
    
    await executeQuery(deleteQuery, [imageId, id]);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Imagen eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando imagen:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la imagen' },
      { status: 500 }
    );
  }
}
