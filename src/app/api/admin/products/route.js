import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { executeWithRetry } from '@/lib/db-utils';
import { invalidateProductRelatedCache } from '@/lib/redis';
import { SalesCache, KPICache } from '@/lib/redis';

export async function GET() {
  try {
    // Usar executeWithRetry para manejar reconexiones automáticas
    const productCount = await executeWithRetry(async () => {
      return await prisma.productos.count();
    });
    if (productCount === 0) {
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
      return formattedProduct;
    });
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
    // Crear el producto usando executeWithRetry
    const newProduct = await executeWithRetry(async () => {
      return await prisma.productos.create({
        data: productData
      });
    });
    
    // Invalidar caché de productos y relacionados
    await Promise.all([
      invalidateProductRelatedCache(),
      SalesCache.invalidate(),
      KPICache.invalidate()
    ]);
    
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
