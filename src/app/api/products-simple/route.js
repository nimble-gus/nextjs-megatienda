import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('=== API /api/products-simple iniciada ===');
    
    // Obtener productos sin filtros
    const products = await prisma.productos.findMany({
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
      take: 5
    });
    
    console.log('Productos obtenidos:', products.length);
    
    // Formatear productos
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
        name: product.nombre,
        brand: product.categoria.nombre,
        category: product.categoria.nombre,
        description: product.descripcion,
        image: product.url_imagen,
        thumbnailImage: product.imagenes[0]?.url_imagen || product.url_imagen,
        price: minPrice,
        originalPrice: maxPrice > minPrice ? maxPrice : null,
        minPrice,
        maxPrice,
        priceFormatted: minPrice > 0 ? `Q${minPrice.toFixed(2)}` : 'Sin precio',
        maxPriceFormatted: maxPrice > minPrice ? `Q${maxPrice.toFixed(2)}` : null,
        rating: 5,
        reviewCount: 0,
        hasStock,
        totalStock,
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
    
    return NextResponse.json({
      products: formattedProducts,
      total: products.length
    });
    
  } catch (error) {
    console.error('=== ERROR EN API /api/products-simple ===');
    console.error('Error completo:', error);
    console.error('Stack trace:', error.stack);
    console.error('Mensaje:', error.message);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error.message,
        stack: error.stack
      },
      { status: 500 }
    );
  }
}
