import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Obtener todas las categorías
    const categories = await prisma.categorias.findMany({
      select: {
        id: true,
        nombre: true,
        _count: {
          select: {
            productos: true
          }
        }
      },
      orderBy: {
        nombre: 'asc'
      }
    });

    // Obtener todos los colores
    const colors = await prisma.colores.findMany({
      select: {
        id: true,
        nombre: true,
        codigo_hex: true,
        _count: {
          select: {
            stock: true
          }
        }
      },
      orderBy: {
        nombre: 'asc'
      }
    });

    // Obtener rangos de precios
    const priceStats = await prisma.stock_detalle.aggregate({
      _min: {
        precio: true
      },
      _max: {
        precio: true
      }
    });

    // Formatear respuesta
    const formattedCategories = categories.map(cat => ({
      id: cat.id,
      name: cat.nombre,
      productCount: cat._count.productos
    }));

    const formattedColors = colors.map(color => ({
      id: color.id,
      name: color.nombre,
      hex: color.codigo_hex,
      productCount: color._count.stock
    }));

    return NextResponse.json({
      categories: formattedCategories,
      colors: formattedColors,
      priceRange: {
        min: priceStats._min.precio || 0,
        max: priceStats._max.precio || 1000
      }
    });

  } catch (error) {
    console.error('Error obteniendo filtros:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
