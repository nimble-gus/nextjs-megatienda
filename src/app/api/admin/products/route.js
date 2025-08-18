import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { executeWithRetry } from '@/lib/db-utils';
import { invalidateProductRelatedCache } from '@/lib/redis';

export async function GET() {
  try {
    console.log('=== Iniciando GET /api/admin/products ===');
    
    // Usar executeWithRetry para manejar reconexiones automáticas
    const productCount = await executeWithRetry(async () => {
      return await prisma.productos.count();
    });
    
    console.log(`📊 Total de productos en BD: ${productCount}`);
    
    if (productCount === 0) {
      console.log('📭 No hay productos en la base de datos');
      return NextResponse.json([]);
    }
    
    // Si hay productos, obtenerlos con relaciones usando retry
    const products = await executeWithRetry(async () => {
      return await prisma.productos.findMany({
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
    });

    console.log(`✅ Productos encontrados: ${products.length}`);

    // Formatear los productos para el admin
    const formattedProducts = products.map(product => {
      const hasStock = product.stock.length > 0 && product.stock.some(item => item.cantidad > 0);
      const totalStock = product.stock.reduce((total, item) => total + item.cantidad, 0);
      
      let minPrice = 0;
      let maxPrice = 0;
      
      if (product.stock.length > 0) {
        minPrice = Math.min(...product.stock.map(s => s.precio));
        maxPrice = Math.max(...product.stock.map(s => s.precio));
      }

      const formattedProduct = {
        id: product.id,
        sku: product.sku,
        nombre: product.nombre,
        descripcion: product.descripcion,
        url_imagen: product.url_imagen,
        categoria: product.categoria?.nombre || 'Sin categoría',
        featured: product.featured,
        stock: totalStock,
        hasStock,
        minPrice,
        maxPrice,
        precio: minPrice > 0 ? minPrice : null
      };

      // Debug: Log para verificar la imagen del producto en admin
      console.log(`Admin - Producto ${product.id} - ${product.nombre}:`, {
        url_imagen: product.url_imagen
      });

      return formattedProduct;
    });

    console.log('✅ Productos formateados exitosamente');
    return NextResponse.json(formattedProducts);
    
  } catch (error) {
    console.error('=== ERROR EN GET /api/admin/products ===');
    console.error('Error completo:', error);
    console.error('Stack trace:', error.stack);
    console.error('Mensaje:', error.message);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const productData = await request.json();
    
    console.log('=== Iniciando POST /api/admin/products ===');
    console.log('Datos del producto:', productData);
    
    // Crear el producto usando executeWithRetry
    const newProduct = await executeWithRetry(async () => {
      return await prisma.productos.create({
        data: productData
      });
    });
    
    console.log('✅ Producto creado exitosamente:', newProduct.id);
    
    // Invalidar caché de productos
    await invalidateProductRelatedCache();
    
    return NextResponse.json({
      success: true,
      product: newProduct,
      message: 'Producto creado exitosamente'
    });
    
  } catch (error) {
    console.error('=== ERROR EN POST /api/admin/products ===');
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
