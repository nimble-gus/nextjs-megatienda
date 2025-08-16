import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('=== API /api/admin/products iniciada ===');
    
    // Obtener productos para el admin (sin filtros, sin paginación)
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
    
    console.log('Productos obtenidos para admin:', products.length);
    
    // Formatear productos para el admin
    const formattedProducts = products.map(product => {
      const hasStock = product.stock.length > 0 && product.stock.some(item => item.cantidad > 0);
      const totalStock = product.stock.reduce((total, item) => total + item.cantidad, 0);
      
      let minPrice = 0;
      let maxPrice = 0;
      
      if (product.stock.length > 0) {
        minPrice = Math.min(...product.stock.map(s => s.precio));
        maxPrice = Math.max(...product.stock.map(s => s.precio));
      }

      return {
        id: product.id,
        sku: product.sku,
        nombre: product.nombre,
        descripcion: product.descripcion,
        url_imagen: product.url_imagen,
        categoria: product.categoria,
        featured: product.featured,
        stock: product.stock,
        hasStock,
        totalStock,
        minPrice,
        maxPrice,
        priceFormatted: minPrice > 0 ? `Q${minPrice.toFixed(2)}` : 'Sin precio'
      };
    });
    
    return NextResponse.json({
      success: true,
      products: formattedProducts,
      total: products.length
    });
    
  } catch (error) {
    console.error('=== ERROR EN API /api/admin/products ===');
    console.error('Error completo:', error);
    console.error('Stack trace:', error.stack);
    console.error('Mensaje:', error.message);
    
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
