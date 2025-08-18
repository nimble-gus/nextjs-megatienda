import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Obtener stock detallado de un producto
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const stockItems = await prisma.stock_detalle.findMany({
      where: {
        producto_id: parseInt(id)
      },
      include: {
        color: true,
        producto: {
          select: {
            id: true,
            nombre: true
          }
        }
      }
    });

    return NextResponse.json(stockItems);
  } catch (error) {
    console.error('Error obteniendo stock:', error);
    return NextResponse.json(
      { error: 'Error al obtener el stock del producto' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Actualizar stock de un producto
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { stockUpdates } = await request.json();
    
    // Actualizar cada item de stock
    const updatePromises = stockUpdates.map(update => 
      prisma.stock_detalle.update({
        where: { id: update.id },
        data: {
          cantidad: update.cantidad,
          precio: update.precio
        }
      })
    );
    
    await Promise.all(updatePromises);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Stock actualizado exitosamente' 
    });
  } catch (error) {
    console.error('Error actualizando stock:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el stock' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
