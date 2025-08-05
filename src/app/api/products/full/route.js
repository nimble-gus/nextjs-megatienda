import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req) {
  const { sku, nombre, descripcion, url_imagen, categoria_id, stock } = await req.json();

  try {
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

    return NextResponse.json({ message: 'Producto y stock creados correctamente', productId: producto.id });
  } catch (error) {
    console.error('Error creando producto:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
