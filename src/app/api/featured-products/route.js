import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { executeWithRetry } from '@/lib/db-utils';

export async function GET() {
  try {
    console.log('=== API /api/featured-products iniciada ===');
    
    // Obtener productos destacados (solo los que tienen featured = 1) usando retry
    const featuredProducts = await executeWithRetry(async () => {
      return await prisma.productos.findMany({
        where: {
          featured: true // Solo productos marcados como destacados
        },
        include: {
          categoria: true,
          imagenes: {
            take: 1
          },
          stock: {
            include: {
              color: true
            }
          }
        },
        orderBy: {
          // Ordenar por ID de forma aleatoria usando una función de base de datos
          id: 'asc'
        },
        take: 4 // Limitar a 4 productos destacados
      });
    });
    
    console.log('Productos destacados obtenidos:', featuredProducts.length);
    
    // Mezclar aleatoriamente los productos en JavaScript
    const shuffledProducts = featuredProducts.sort(() => Math.random() - 0.5);
    
    // Formatear productos para el frontend
    const formattedProducts = shuffledProducts.map(product => {
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
        name: product.nombre,
        brand: product.categoria.nombre,
        category: product.categoria.nombre,
        description: product.descripcion,
        image: product.url_imagen,
        thumbnailImage: product.imagenes[0]?.url_imagen || product.url_imagen,
        price: minPrice,
        originalPrice: maxPrice > minPrice ? maxPrice : null,
        priceFormatted: minPrice > 0 ? `Q${minPrice.toFixed(2)}` : 'Sin precio',
        rating: 5,
        reviewCount: 0,
        hasStock,
        totalStock,
        featured: true, // Todos los productos de esta consulta son destacados
        colors: product.stock.map(stockItem => ({
          id: stockItem.color.id,
          name: stockItem.color.nombre,
          hex: stockItem.color.codigo_hex,
          available: stockItem.cantidad > 0,
          stock: stockItem.cantidad,
          price: stockItem.precio,
          priceFormatted: `Q${stockItem.precio.toFixed(2)}`
        }))
      };
    });
    
    console.log('Productos formateados:', formattedProducts.length);
    
    return NextResponse.json({
      success: true,
      products: formattedProducts,
      total: formattedProducts.length
    });
    
  } catch (error) {
    console.error('=== ERROR EN API /api/featured-products ===');
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
