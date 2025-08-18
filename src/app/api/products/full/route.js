import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    console.log('=== API /api/products/full iniciada ===');
    
    const { sku, nombre, descripcion, url_imagen, categoria_id, stock, imagenes_adicionales } = await req.json();
    
    console.log('Datos recibidos:', {
      sku,
      nombre,
      categoria_id,
      stockCount: stock?.length || 0,
      imagenesCount: imagenes_adicionales?.length || 0
    });

    // Verificar si DATABASE_URL está configurada
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.log('❌ DATABASE_URL no configurada');
      return NextResponse.json({ 
        error: 'Base de datos no configurada',
        message: 'Necesitas configurar DATABASE_URL en el archivo .env'
      }, { status: 500 });
    }
    
    // Si DATABASE_URL está configurada, intentar usar Prisma
    console.log('✅ DATABASE_URL configurada, intentando conectar a la base de datos');
    
    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      
      // Verificar conexión
      await prisma.$connect();
      console.log('✅ Conexión a la base de datos exitosa');
      
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

      console.log(`✅ Producto creado con ID: ${producto.id}`);

      // Si hay imágenes adicionales, guardarlas en la tabla imagenes_producto
      if (imagenes_adicionales && imagenes_adicionales.length > 0) {
        await prisma.imagenes_producto.createMany({
          data: imagenes_adicionales.map(url => ({
            producto_id: producto.id,
            url_imagen: url
          }))
        });
        console.log(`✅ ${imagenes_adicionales.length} imágenes adicionales guardadas`);
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
