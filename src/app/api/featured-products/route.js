import { NextResponse } from 'next/server';
import { getFeaturedProducts } from '@/lib/mysql-direct';

export async function GET() {
  try {
    // Obtener productos destacados usando conexión directa
    const featuredProducts = await getFeaturedProducts();
    
    // Formatear productos para el frontend
    const formattedProducts = featuredProducts.map(product => {
      const hasStock = product.stock_total > 0;
      
      return {
        id: product.id,
        sku: product.sku,
        name: product.nombre,
        brand: product.categoria_nombre,
        category: product.categoria_nombre,
        description: product.descripcion,
        image: product.url_imagen,
        thumbnailImage: product.url_imagen,
        price: product.precio_min || 0,
        originalPrice: product.precio_max > product.precio_min ? product.precio_max : null,
        priceFormatted: product.precio_min > 0 ? `Q${product.precio_min.toFixed(2)}` : 'Sin precio',
        rating: 5,
        reviewCount: 0,
        hasStock,
        totalStock: product.stock_total || 0,
        featured: true,
        colors: [] // Simplificado por ahora
      };
    });
    
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
