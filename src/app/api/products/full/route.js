import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req) {
  try {
    const { sku, nombre, descripcion, url_imagen, categoria_id, stock, imagenes_adicionales } = await req.json();
    // Verificar si DATABASE_URL está configurada
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return NextResponse.json({ 
        error: 'Base de datos no configurada',
        message: 'Necesitas configurar DATABASE_URL en el archivo .env'
      }, { status: 500 });
    }
    
    // Si DATABASE_URL está configurada, intentar usar Prisma
    try {
      // Crear el producto principal
      const producto = await prisma.productos.create({
        data: {
          sku,
          nombre,
          descripcion,
          url_imagen,
          categoria_id,
          stock: {
            create: stock.map(s => ({
              color_id: s.color_id,
              cantidad: s.cantidad,
              precio: s.precio
            }))
          }
        }
      });
      // Si hay imágenes adicionales, guardarlas en la tabla imagenes_producto
      if (imagenes_adicionales && imagenes_adicionales.length > 0) {
        await prisma.imagenes_producto.createMany({
          data: imagenes_adicionales.map(url => ({
            producto_id: producto.id,
            url_imagen: url
          }))
        });
      }

      await prisma.$disconnect();
      
      return NextResponse.json({ 
        message: 'Producto, stock e imágenes creados correctamente', 
        productId: producto.id,
        imagenesGuardadas: imagenes_adicionales ? imagenes_adicionales.length : 0
      });
      
    } catch (dbError) {
      console.error('❌ Error de base de datos:', dbError);
      return NextResponse.json({ 
        error: 'Error de conexión a la base de datos',
        details: dbError.message,
        message: 'Verifica que MySQL esté ejecutándose y la configuración sea correcta'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('=== ERROR EN API /api/products/full ===');
    console.error('Error completo:', error);
    
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error.message 
    }, { status: 500 });
  }
}
