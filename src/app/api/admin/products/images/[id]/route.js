import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql-direct';

// DELETE - Eliminar una imagen específica
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    // Verificar si la imagen existe
    const checkImageQuery = `
      SELECT id FROM imagenes_producto WHERE id = ?
    `;
    
    const imageExists = await executeQuery(checkImageQuery, [id]);
    
    if (!imageExists || imageExists.length === 0) {
      return NextResponse.json(
        { error: 'Imagen no encontrada' },
        { status: 404 }
      );
    }
    
    // Eliminar la imagen
    const deleteQuery = `
      DELETE FROM imagenes_producto WHERE id = ?
    `;
    
    await executeQuery(deleteQuery, [id]);
    
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
