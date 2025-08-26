import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Obtener imágenes de un producto
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const images = await prisma.imagenes_producto.findMany({
      where: {
        producto_id: parseInt(id)
      },
      orderBy: {
        id: 'asc'
      }
    });

    return NextResponse.json(images);
  } catch (error) {
    console.error('Error obteniendo imágenes:', error);
    return NextResponse.json(
      { error: 'Error al obtener las imágenes del producto' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
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

    const newImage = await prisma.imagenes_producto.create({
      data: {
        producto_id: parseInt(id),
        url_imagen: url_imagen.trim()
      }
    });
    
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
  } finally {
    await prisma.$disconnect();
  }
}
