import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma-production';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    // Obtener el producto con todas sus relaciones
    const product = await prisma.productos.findUnique({
      where: { id: parseInt(id) },
      include: {
        categoria: true,
        imagenes: true,
        stock: {
          include: {
            color: true
          }
        }
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    // Formatear los datos para el frontend
    const formattedProduct = {
      id: product.id,
      sku: product.sku,
      name: product.nombre,
      description: product.descripcion,
      category: product.categoria.nombre,
      categoryId: product.categoria.id,
      mainImage: product.url_imagen,
      images: product.imagenes.map(img => img.url_imagen),
      colors: product.stock.map(stockItem => ({
        id: stockItem.color.id,
        name: stockItem.color.nombre,
        hex: stockItem.color.codigo_hex,
        stock: stockItem.cantidad,
        price: stockItem.precio,
        available: stockItem.cantidad > 0
      })),
      // Calcular precio mínimo y máximo
      minPrice: Math.min(...product.stock.map(s => s.precio)),
      maxPrice: Math.max(...product.stock.map(s => s.precio)),
      totalStock: product.stock.reduce((total, item) => total + item.cantidad, 0),
      hasStock: product.stock.some(item => item.cantidad > 0)
    };

    return NextResponse.json(formattedProduct);
  } catch (error) {
    console.error('Error obteniendo producto:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
