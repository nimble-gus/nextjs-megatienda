import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PATCH - Actualizar cantidad de un item del carrito
export async function PATCH(request, { params }) {
  try {
    const { itemId } = params;
    const { cantidad } = await request.json();
    
    console.log('Actualizando item del carrito:', itemId, 'cantidad:', cantidad);

    if (!cantidad || cantidad < 1) {
      return NextResponse.json(
        { error: 'La cantidad debe ser mayor a 0' },
        { status: 400 }
      );
    }

    // Primero obtener el item actual para verificar el stock
    const currentItem = await prisma.carrito.findUnique({
      where: {
        id: parseInt(itemId)
      },
      include: {
        producto: {
          include: {
            stock: true
          }
        }
      }
    });

    if (!currentItem) {
      return NextResponse.json(
        { error: 'Item del carrito no encontrado' },
        { status: 404 }
      );
    }

    // Verificar stock disponible (solo validación básica)
    const stockItem = currentItem.producto.stock.find(stock => stock.color_id === currentItem.color_id);
    const stockDisponible = stockItem ? stockItem.cantidad : 0;

    // Validación más permisiva: permitir hasta el stock disponible + cantidad actual en carrito
    const cantidadActualEnCarrito = currentItem.cantidad;
    const stockTotalDisponible = stockDisponible + cantidadActualEnCarrito;

    if (cantidad > stockTotalDisponible) {
      return NextResponse.json(
        { 
          error: `Solo hay ${stockDisponible} unidades disponibles de este producto`,
          stockDisponible: stockDisponible
        },
        { status: 400 }
      );
    }

    const updatedItem = await prisma.carrito.update({
      where: {
        id: parseInt(itemId)
      },
      data: {
        cantidad: parseInt(cantidad)
      },
      include: {
        producto: {
          include: {
            categoria: true,
            stock: true // Incluir stock para obtener el precio
          }
        },
        color: true
      }
    });

    console.log('Item actualizado exitosamente');

    // Buscar el stock correspondiente al color
    const updatedStockItem = updatedItem.producto.stock.find(stock => stock.color_id === updatedItem.color_id);
    const precio = updatedStockItem ? updatedStockItem.precio : 0;
    const updatedStockDisponible = updatedStockItem ? updatedStockItem.cantidad : 0;

    // Formatear la respuesta
    const formattedItem = {
      id: updatedItem.id,
      cantidad: updatedItem.cantidad,
      precio: precio,
      stockDisponible: updatedStockDisponible,
      producto: {
        id: updatedItem.producto.id,
        nombre: updatedItem.producto.nombre,
        sku: updatedItem.producto.sku,
        descripcion: updatedItem.producto.descripcion,
        url_imagen: updatedItem.producto.url_imagen,
        categoria: updatedItem.producto.categoria
      },
      color: {
        id: updatedItem.color.id,
        nombre: updatedItem.color.nombre,
        codigo_hex: updatedItem.color.codigo_hex
      }
    };

    return NextResponse.json({
      success: true,
      item: formattedItem
    });

  } catch (error) {
    console.error('Error actualizando item del carrito:', error);
    return NextResponse.json(
      { 
        error: 'Error al actualizar el item del carrito',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar un item del carrito
export async function DELETE(request, { params }) {
  try {
    const { itemId } = params;
    
    console.log('Eliminando item del carrito:', itemId);

    await prisma.carrito.delete({
      where: {
        id: parseInt(itemId)
      }
    });

    console.log('Item eliminado exitosamente');

    return NextResponse.json({
      success: true,
      message: 'Item eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando item del carrito:', error);
    return NextResponse.json(
      { 
        error: 'Error al eliminar el item del carrito',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
