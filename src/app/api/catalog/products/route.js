import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { executeWithRetry, checkDatabaseHealth } from '@/lib/db-utils';
import { ProductCache } from '@/lib/redis';
import { queueQuery } from '@/lib/query-queue';
import 'dotenv/config';

export async function GET(request) {
  try {
    console.log('=== API /api/catalog/products iniciada ===');
    
    const { searchParams } = new URL(request.url);
    
    // Parámetros de paginación
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 12;
    const sortBy = searchParams.get('sortBy') || 'default';
    
    // Filtros
    const minPrice = parseFloat(searchParams.get('minPrice')) || 0;
    const maxPrice = parseFloat(searchParams.get('maxPrice')) || 999999;
    const category = searchParams.get('category');
    const colors = searchParams.getAll('colors');
    const search = searchParams.get('search');
    
    console.log('Parámetros recibidos:', {
      page,
      limit,
      sortBy,
      minPrice,
      maxPrice,
      category,
      colors,
      search
    });
    
    // Verificar si DATABASE_URL está configurada
    const databaseUrl = process.env.DATABASE_URL;
    console.log('🔍 DATABASE_URL detectada:', databaseUrl ? 'SÍ' : 'NO');
    console.log('🔍 DATABASE_URL valor:', databaseUrl ? databaseUrl.substring(0, 50) + '...' : 'undefined');
    console.log('🔍 Todas las variables de entorno:', Object.keys(process.env).filter(key => key.includes('DATABASE')));
    
    if (!databaseUrl) {
      console.log('❌ DATABASE_URL no configurada, devolviendo datos de prueba');
      
      // Datos de prueba con las propiedades correctas para ProductCard
      const testProducts = [
        {
          id: 1,
          sku: 'TEST-001',
          name: 'Producto de Prueba 1',
          nombre: 'Producto de Prueba 1',
          descripcion: 'Descripción del producto de prueba 1',
          image: 'https://via.placeholder.com/300x300/4F46E5/FFFFFF?text=Producto+1',
          url_imagen: 'https://via.placeholder.com/300x300/4F46E5/FFFFFF?text=Producto+1',
          categoria: 'Ropa',
          categoria_id: 1,
          featured: false,
          stock: 10,
          hasStock: true,
          minPrice: 29.99,
          maxPrice: 29.99,
          price: 29.99,
          precio: 29.99,
          originalPrice: 39.99,
          brand: 'Marca Test',
          rating: 4.5,
          colores: [
            { id: 1, nombre: 'Negro', codigo_hex: '#000000', available: true },
            { id: 2, nombre: 'Blanco', codigo_hex: '#FFFFFF', available: true }
          ],
          imagenes_adicionales: []
        },
        {
          id: 2,
          sku: 'TEST-002',
          name: 'Producto de Prueba 2',
          nombre: 'Producto de Prueba 2',
          descripcion: 'Descripción del producto de prueba 2',
          image: 'https://via.placeholder.com/300x300/10B981/FFFFFF?text=Producto+2',
          url_imagen: 'https://via.placeholder.com/300x300/10B981/FFFFFF?text=Producto+2',
          categoria: 'Electrónica',
          categoria_id: 2,
          featured: true,
          stock: 5,
          hasStock: true,
          minPrice: 99.99,
          maxPrice: 99.99,
          price: 99.99,
          precio: 99.99,
          originalPrice: 129.99,
          brand: 'Tech Brand',
          rating: 4.8,
          colores: [
            { id: 3, nombre: 'Azul', codigo_hex: '#0000FF', available: true }
          ],
          imagenes_adicionales: []
        },
        {
          id: 3,
          sku: 'TEST-003',
          name: 'Producto de Prueba 3',
          nombre: 'Producto de Prueba 3',
          descripcion: 'Descripción del producto de prueba 3',
          image: 'https://via.placeholder.com/300x300/F59E0B/FFFFFF?text=Producto+3',
          url_imagen: 'https://via.placeholder.com/300x300/F59E0B/FFFFFF?text=Producto+3',
          categoria: 'Calzado',
          categoria_id: 3,
          featured: false,
          stock: 15,
          hasStock: true,
          minPrice: 49.99,
          maxPrice: 49.99,
          price: 49.99,
          precio: 49.99,
          originalPrice: 49.99,
          brand: 'Shoe Brand',
          rating: 4.2,
          colores: [
            { id: 1, nombre: 'Negro', codigo_hex: '#000000', available: true },
            { id: 4, nombre: 'Rojo', codigo_hex: '#FF0000', available: true }
          ],
          imagenes_adicionales: []
        }
      ];
      
      const totalProducts = testProducts.length;
      const totalPages = Math.ceil(totalProducts / limit);
      
      return NextResponse.json({
        success: true,
        products: testProducts,
        pagination: {
          currentPage: page,
          totalPages,
          totalProducts,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      });
    }
    
         // Si DATABASE_URL está configurada, intentar usar Prisma
     console.log('✅ DATABASE_URL configurada, intentando conectar a la base de datos');
     
     // Verificar caché primero
     const cacheKey = {
       page,
       limit,
       sortBy,
       minPrice,
       maxPrice,
       category,
       colors: colors.sort(),
       search
     };
     
           const cachedData = await ProductCache.get(cacheKey);
      if (cachedData) {
        console.log('✅ Datos obtenidos del caché Redis');
        return NextResponse.json(cachedData);
      }
     
     console.log('🔄 Datos no encontrados en caché, consultando base de datos...');
     
     try {
        const { prisma } = await import('@/lib/prisma');
        const { executeWithRetry, checkDatabaseHealth } = await import('@/lib/db-utils');
        
        console.log('✅ Intentando conectar a la base de datos...');
        
        // Verificar salud de la conexión
        const health = await checkDatabaseHealth();
        console.log('🔍 Estado de la conexión:', health.message);
      
      // Calcular offset para paginación
      const offset = (page - 1) * limit;
      
      // Construir filtros de Prisma
      const where = {
        AND: []
      };
      
      // Filtro de precio
      where.AND.push({
        stock: {
          some: {
            precio: {
              gte: minPrice,
              lte: maxPrice
            }
          }
        }
      });
      
      // Filtro de categoría
      if (category) {
        where.AND.push({
          categoria_id: parseInt(category)
        });
      }
      
      // Filtro de colores
      if (colors.length > 0) {
        where.AND.push({
          stock: {
            some: {
              color_id: {
                in: colors.map(c => parseInt(c))
              }
            }
          }
        });
      }
      
      // Filtro de búsqueda
      if (search) {
        where.AND.push({
          OR: [
            { nombre: { contains: search, mode: 'insensitive' } },
            { descripcion: { contains: search, mode: 'insensitive' } },
            { sku: { contains: search, mode: 'insensitive' } }
          ]
        });
      }
      
      // Ordenamiento
      let orderBy = {};
      switch (sortBy) {
        case 'price_asc':
          orderBy = { stock: { orderBy: { precio: 'asc' } } };
          break;
        case 'price_desc':
          orderBy = { stock: { orderBy: { precio: 'desc' } } };
          break;
        case 'name_asc':
          orderBy = { nombre: 'asc' };
          break;
        case 'name_desc':
          orderBy = { nombre: 'desc' };
          break;
        case 'newest':
          orderBy = { id: 'desc' };
          break;
        default:
          orderBy = { id: 'desc' };
      }
      
                                                     // Obtener productos con relaciones usando cola de consultas
         const products = await queueQuery(async () => {
           return await executeWithRetry(async () => {
             return await prisma.productos.findMany({
               where,
               include: {
                 categoria: true,
                 stock: {
                   include: {
                     color: true
                   }
                 },
                 imagenes: true
               },
               orderBy,
               skip: offset,
               take: limit
             });
           });
         });
      
      console.log(`✅ Productos encontrados: ${products.length}`);
      
                           // Contar total de productos para paginación usando cola de consultas
        const totalProducts = await queueQuery(async () => {
          return await executeWithRetry(async () => {
            return await prisma.productos.count({ where });
          });
        });
      const totalPages = Math.ceil(totalProducts / limit);
      
      // Formatear productos para el frontend
      const formattedProducts = products.map(product => {
        const hasStock = product.stock.length > 0 && product.stock.some(item => item.cantidad > 0);
        const totalStock = product.stock.reduce((total, item) => total + item.cantidad, 0);
        
        let minPrice = 0;
        let maxPrice = 0;
        
        if (product.stock.length > 0) {
          minPrice = Math.min(...product.stock.map(s => s.precio));
          maxPrice = Math.max(...product.stock.map(s => s.precio));
        }
        
        // Obtener colores disponibles
        const availableColors = product.stock
          .filter(item => item.cantidad > 0)
          .map(item => ({
            id: item.color.id,
            nombre: item.color.nombre,
            codigo_hex: item.color.codigo_hex,
            available: true
          }));
        
        // Obtener imágenes adicionales
        const additionalImages = product.imagenes.map(img => img.url_imagen);
        
        const formattedProduct = {
          id: product.id,
          sku: product.sku,
          name: product.nombre, // Propiedad que espera ProductCard
          nombre: product.nombre,
          descripcion: product.descripcion,
          image: product.url_imagen, // Propiedad que espera ProductCard
          url_imagen: product.url_imagen,
          categoria: product.categoria?.nombre || 'Sin categoría',
          categoria_id: product.categoria_id,
          featured: product.featured,
          stock: totalStock,
          hasStock,
          minPrice,
          maxPrice,
          price: minPrice > 0 ? minPrice : null, // Propiedad que espera ProductCard
          precio: minPrice > 0 ? minPrice : null,
          originalPrice: maxPrice > minPrice ? maxPrice : null, // Propiedad que espera ProductCard
          brand: 'Marca', // Valor por defecto
          rating: 4.5, // Valor por defecto
          colores: availableColors,
          imagenes_adicionales: additionalImages
        };
        
        // Debug: Log para verificar la imagen del producto
        console.log(`Producto ${product.id} - ${product.nombre}:`, {
          url_imagen: product.url_imagen,
          image: formattedProduct.image
        });
        
        return formattedProduct;
      });
      
             await prisma.$disconnect();
       
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
       
               // Almacenar en caché Redis para futuras consultas
        await ProductCache.set(cacheKey, responseData);
        console.log('✅ Datos almacenados en caché Redis');
       
       return NextResponse.json(responseData);
      
         } catch (dbError) {
       console.error('❌ Error de base de datos:', dbError);
       console.error('🔍 Tipo de error:', dbError.constructor.name);
       console.error('🔍 Código de error:', dbError.code);
       
       // Si es un error de conexión, devolver datos de prueba
       if (dbError.code === 'P1001' || dbError.message.includes('Can\'t reach database server')) {
         console.log('🔄 Devolviendo datos de prueba debido a error de conexión');
       }
      const testProducts = [
        {
          id: 1,
          sku: 'TEST-001',
          name: 'Producto de Prueba 1',
          nombre: 'Producto de Prueba 1',
          descripcion: 'Descripción del producto de prueba 1',
          image: 'https://via.placeholder.com/300x300/4F46E5/FFFFFF?text=Producto+1',
          url_imagen: 'https://via.placeholder.com/300x300/4F46E5/FFFFFF?text=Producto+1',
          categoria: 'Ropa',
          categoria_id: 1,
          featured: false,
          stock: 10,
          hasStock: true,
          minPrice: 29.99,
          maxPrice: 29.99,
          price: 29.99,
          precio: 29.99,
          originalPrice: 39.99,
          brand: 'Marca Test',
          rating: 4.5,
          colores: [
            { id: 1, nombre: 'Negro', codigo_hex: '#000000', available: true },
            { id: 2, nombre: 'Blanco', codigo_hex: '#FFFFFF', available: true }
          ],
          imagenes_adicionales: []
        }
      ];
      
      return NextResponse.json({
        success: true,
        products: testProducts,
        pagination: {
          currentPage: page,
          totalPages: 1,
          totalProducts: 1,
          itemsPerPage: limit,
          hasNextPage: false,
          hasPrevPage: false
        }
      });
    }
    
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
