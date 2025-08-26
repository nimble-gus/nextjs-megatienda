import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parámetros de consulta
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 12;
    const category = searchParams.get('category');
    
    // Parsear precios de forma segura
    const minPriceParam = searchParams.get('minPrice');
    const maxPriceParam = searchParams.get('maxPrice');
    const minPrice = minPriceParam ? parseFloat(minPriceParam) : null;
    const maxPrice = maxPriceParam ? parseFloat(maxPriceParam) : null;
    
    const colors = searchParams.get('colors')?.split(',');
    const sortBy = searchParams.get('sortBy') || 'default';
    const search = searchParams.get('search');
    // Calcular offset para paginación
    const offset = (page - 1) * limit;

    // Construir filtros
    const where = {};

    // Filtro por categoría
    if (category) {
      where.categoria_id = parseInt(category);
    }

    // Construir filtros de stock combinados
    const stockFilters = [];
    
    // Filtro por precio
    if ((minPrice !== null && !isNaN(minPrice)) || (maxPrice !== null && !isNaN(maxPrice))) {
      const priceFilter = {};
      
      if ((minPrice !== null && !isNaN(minPrice)) && (maxPrice !== null && !isNaN(maxPrice))) {
        priceFilter.precio = {
          gte: minPrice,
          lte: maxPrice
        };
      } else if (minPrice !== null && !isNaN(minPrice)) {
        priceFilter.precio = {
          gte: minPrice
        };
      } else if (maxPrice !== null && !isNaN(maxPrice)) {
        priceFilter.precio = {
          lte: maxPrice
        };
      }
      
      if (Object.keys(priceFilter).length > 0) {
        stockFilters.push(priceFilter);
      }
    }

    // Filtro por colores
    if (colors && colors.length > 0 && colors[0] !== '') {
      const validColors = colors.filter(color => color !== '').map(id => parseInt(id));
      if (validColors.length > 0) {
        stockFilters.push({
          color_id: {
            in: validColors
          }
        });
      }
    }
    
    // Aplicar filtros de stock si existen
    if (stockFilters.length > 0) {
      where.stock = {
        some: stockFilters.length === 1 ? stockFilters[0] : {
          AND: stockFilters
        }
      };
    }

    // Filtro por búsqueda
    if (search) {
      where.OR = [
        {
          nombre: {
            contains: search
          }
        },
        {
          descripcion: {
            contains: search
          }
        },
        {
          sku: {
            contains: search
          }
        }
      ];
    }

    // Construir ordenamiento
    let orderBy = {};
    switch (sortBy) {
      case 'price-low':
        orderBy.stock = {
          precio: 'asc'
        };
        break;
      case 'price-high':
        orderBy.stock = {
          precio: 'desc'
        };
        break;
      case 'name-asc':
        orderBy.nombre = 'asc';
        break;
      case 'name-desc':
        orderBy.nombre = 'desc';
        break;
      default:
        orderBy.id = 'desc';
    }

    // Obtener productos con relaciones
    const products = await prisma.productos.findMany({
      where,
      include: {
        categoria: true,
        imagenes: {
          take: 1 // Solo la primera imagen para thumbnail
        },
        stock: {
          include: {
            color: true
          }
        }
      },
      orderBy,
      skip: offset,
      take: limit
    });

    // Contar total de productos para paginación
    const totalProducts = await prisma.productos.count({ where });
    const totalPages = Math.ceil(totalProducts / limit);
    // Formatear productos para el frontend
    const formattedProducts = products.map((product, index) => {
      try {
        // Manejar productos sin stock
        const hasStock = product.stock.length > 0 && product.stock.some(item => item.cantidad > 0);
        const totalStock = product.stock.reduce((total, item) => total + item.cantidad, 0);
        
        // Calcular precios solo si hay stock
        let minPrice = 0;
        let maxPrice = 0;
        
        if (product.stock.length > 0) {
          minPrice = Math.min(...product.stock.map(s => s.precio));
          maxPrice = Math.max(...product.stock.map(s => s.precio));
        }

        const formattedProduct = {
          id: product.id,
          sku: product.sku,
          name: product.nombre,
          brand: product.categoria.nombre, // Usar categoría como brand temporalmente
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
          rating: 5, // Placeholder - implementar sistema de ratings
          reviewCount: 0, // Placeholder
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

        return formattedProduct;
      } catch (error) {
        console.error(`Error formateando producto ${product.id}:`, error);
        throw error;
      }
    });
    const response = {
      products: formattedProducts,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('=== ERROR EN API /api/products ===');
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
