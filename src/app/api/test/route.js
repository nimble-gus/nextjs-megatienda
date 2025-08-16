import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Verificar conexión básica
    const productCount = await prisma.productos.count();
    const categoryCount = await prisma.categorias.count();
    const colorCount = await prisma.colores.count();
    const stockCount = await prisma.stock_detalle.count();

    // Obtener algunos productos de ejemplo
    const sampleProducts = await prisma.productos.findMany({
      take: 3,
      include: {
        categoria: true,
        stock: {
          include: {
            color: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      counts: {
        products: productCount,
        categories: categoryCount,
        colors: colorCount,
        stock: stockCount
      },
      sampleProducts: sampleProducts.map(p => ({
        id: p.id,
        sku: p.sku,
        name: p.nombre,
        category: p.categoria.nombre,
        stockVariants: p.stock.length
      }))
    });

  } catch (error) {
    console.error('Error en test API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        stack: error.stack
      },
      { status: 500 }
    );
  }
}
