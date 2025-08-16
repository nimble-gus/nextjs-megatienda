import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Obtener items del carrito de un usuario
export async function GET(request, { params }) {
  try {
    const { userId } = params;
    
    console.log('Obteniendo carrito para usuario:', userId);

    const cartItems = await prisma.carrito.findMany({
      where: {
        usuario_id: parseInt(userId)
      },
      include: {
        producto: {
          include: {
            categoria: true,
            stock: true // Incluir stock para obtener el precio
          }
        },
        color: true
      },
      orderBy: {
        id: 'asc'
      }
    });

    console.log('Items del carrito encontrados:', cartItems.length);

    // Formatear los items para el frontend
    const formattedItems = cartItems.map(item => {
      // Buscar el stock correspondiente al color
      const stockItem = item.producto.stock.find(stock => stock.color_id === item.color_id);
      const precio = stockItem ? stockItem.precio : 0;
      const stockDisponible = stockItem ? stockItem.cantidad : 0;

      return {
        id: item.id,
        cantidad: item.cantidad,
        precio: precio,
        stockDisponible: stockDisponible,
        producto: {
          id: item.producto.id,
          nombre: item.producto.nombre,
          sku: item.producto.sku,
          descripcion: item.producto.descripcion,
          url_imagen: item.producto.url_imagen,
          categoria: item.producto.categoria
        },
        color: {
          id: item.color.id,
          nombre: item.color.nombre,
          codigo_hex: item.color.codigo_hex
        }
      };
    });

    return NextResponse.json({
      success: true,
      items: formattedItems,
      totalItems: formattedItems.length
    });

  } catch (error) {
    console.error('Error obteniendo carrito:', error);
    return NextResponse.json(
      { 
        error: 'Error al obtener el carrito',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// DELETE - Limpiar todo el carrito de un usuario
export async function DELETE(request, { params }) {
  try {
    const { userId } = params;
    
    console.log('Limpiando carrito para usuario:', userId);

    await prisma.carrito.deleteMany({
      where: {
        usuario_id: parseInt(userId)
      }
    });

    console.log('Carrito limpiado exitosamente');

    return NextResponse.json({
      success: true,
      message: 'Carrito limpiado exitosamente'
    });

  } catch (error) {
    console.error('Error limpiando carrito:', error);
    return NextResponse.json(
      { 
        error: 'Error al limpiar el carrito',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
