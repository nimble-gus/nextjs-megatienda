import { NextResponse } from 'next/server';
import { getCatalogProducts, getCatalogProductsCount } from '@/lib/mysql-direct';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parámetros de paginación
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 12;
    const sortBy = searchParams.get('sortBy') || 'default';
    
    // Filtros
    const minPrice = parseFloat(searchParams.get('minPrice')) || 0;
    const maxPrice = parseFloat(searchParams.get('maxPrice')) || 999999;
    const categories = searchParams.getAll('categories');
    const colors = searchParams.getAll('colors');
    const search = searchParams.get('search');

    // Obtener productos usando conexión directa
    const products = await getCatalogProducts({
      page,
      limit,
      sortBy,
      minPrice,
      maxPrice,
      categories,
      colors,
      search
    });

    // Obtener total de productos para paginación
    const totalProducts = await getCatalogProductsCount({
      minPrice,
      maxPrice,
      categories,
      search
    });

    const totalPages = Math.ceil(totalProducts / limit);
    
    // Formatear productos para el frontend
    const formattedProducts = products.map(product => {
      const hasStock = product.stock_total > 0;
      
      return {
        id: product.id,
        sku: product.sku,
        name: product.nombre,
        nombre: product.nombre,
        descripcion: product.descripcion,
        image: product.url_imagen,
        url_imagen: product.url_imagen,
        categoria: product.categoria_nombre || 'Sin categoría',
        categoria_id: product.categoria_id,
        featured: product.featured,
        stock: product.stock_total || 0,
        hasStock,
        minPrice: product.precio_min || 0,
        maxPrice: product.precio_max || 0,
        price: product.precio_min || 0,
        precio: product.precio_min || 0,
        originalPrice: product.precio_max > product.precio_min ? product.precio_max : null,
        rating: 4.5,
        colores: [], // Simplificado por ahora
        imagenes_adicionales: []
      };
    });
    
    const responseData = {
      success: true,
      products: formattedProducts,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('=== ERROR EN API /api/catalog/products ===');
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
