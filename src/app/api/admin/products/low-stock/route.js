import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Obtener productos con stock total menor a 10 unidades
    const products = await prisma.productos.findMany({
      include: {
        categoria: true,
        stock: {
          include: {
            color: true
          }
        }
      },
      orderBy: {
        id: 'desc'
      }
    });

    // Filtrar productos con stock bajo (menor a 10 unidades total) o agotados
    const lowStockProducts = products
      .map(product => {
        const totalStock = product.stock.reduce((total, item) => total + item.cantidad, 0);
        return {
          ...product,
          totalStock
        };
      })
      .filter(product => product.totalStock < 10) // Incluir productos con stock bajo Y agotados
      .sort((a, b) => a.totalStock - b.totalStock); // Ordenar por stock más bajo primero
    // Formatear productos para el frontend
    const formattedProducts = lowStockProducts.map(product => ({
      id: product.id,
      sku: product.sku,
      nombre: product.nombre,
      descripcion: product.descripcion,
      url_imagen: product.url_imagen,
      categoria: product.categoria?.nombre || 'Sin categoría',
      totalStock: product.totalStock,
      stockDetails: product.stock
        .filter(stock => stock.cantidad > 0) // Solo colores con stock
        .map(stock => ({
          id: stock.id,
          cantidad: stock.cantidad,
          precio: stock.precio,
          color: {
            id: stock.color.id,
            nombre: stock.color.nombre,
            codigo_hex: stock.color.codigo_hex
          }
        }))
        .sort((a, b) => a.cantidad - b.cantidad) // Ordenar por cantidad más baja
    }));

    return NextResponse.json({
      success: true,
      products: formattedProducts,
      total: formattedProducts.length
    });

  } catch (error) {
    console.error('=== ERROR EN API /api/admin/products/low-stock ===');
    console.error('Error completo:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Error interno del servidor',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
