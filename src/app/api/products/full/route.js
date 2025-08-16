import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req) {
  const { sku, nombre, descripcion, url_imagen, categoria_id, stock, imagenes_adicionales } = await req.json();

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

    return NextResponse.json({ 
      message: 'Producto, stock e imágenes creados correctamente', 
      productId: producto.id,
      imagenesGuardadas: imagenes_adicionales ? imagenes_adicionales.length : 0
    });
  } catch (error) {
    console.error('Error creando producto:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
