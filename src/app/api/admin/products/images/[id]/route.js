import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// DELETE - Eliminar una imagen específica
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    // Verificar si la imagen existe
    const image = await prisma.imagenes_producto.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!image) {
      return NextResponse.json(
        { error: 'Imagen no encontrada' },
        { status: 404 }
      );
    }
    
    // Eliminar la imagen
    await prisma.imagenes_producto.delete({
      where: { id: parseInt(id) }
    });
    
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
  } finally {
    await prisma.$disconnect();
  }
}
