import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma-production';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const excludeId = searchParams.get('excludeId');
    const limit = parseInt(searchParams.get('limit')) || 4;

    if (!categoryId) {
      return NextResponse.json(
        { error: 'categoryId es requerido' },
        { status: 400 }
      );
    }

    // Obtener productos de la misma categoría, excluyendo el producto actual
    const relatedProducts = await prisma.productos.findMany({
      where: {
        categoria_id: parseInt(categoryId),
        id: {
          not: excludeId ? parseInt(excludeId) : undefined
        }
      },
      include: {
        categoria: true,
        imagenes: {
          take: 1 // Solo la primera imagen
        },
        stock: {
          include: {
            color: true
          }
        }
      },
      take: limit
    });

    // Formatear los productos relacionados
    const formattedProducts = relatedProducts.map(product => ({
      id: product.id,
      sku: product.sku,
      name: product.nombre,
      category: product.categoria.nombre,
      mainImage: product.url_imagen,
      thumbnailImage: product.imagenes[0]?.url_imagen || product.url_imagen,
      minPrice: Math.min(...product.stock.map(s => s.precio)),
      maxPrice: Math.max(...product.stock.map(s => s.precio)),
      hasStock: product.stock.some(item => item.cantidad > 0),
      colors: product.stock.map(stockItem => ({
        id: stockItem.color.id,
        name: stockItem.color.nombre,
        hex: stockItem.color.codigo_hex,
        available: stockItem.cantidad > 0
      }))
    }));

    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error('Error obteniendo productos relacionados:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
