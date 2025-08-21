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
    const { stockUpdates, newStockItems } = await request.json();
    
    console.log('📦 Actualizando stock para producto:', id);
    console.log('📝 Stock updates:', stockUpdates);
    console.log('➕ New stock items:', newStockItems);
    
    const operations = [];
    
    // Actualizar items de stock existentes
    if (stockUpdates && stockUpdates.length > 0) {
      const updatePromises = stockUpdates.map(update => 
        prisma.stock_detalle.update({
          where: { id: update.id },
          data: {
            cantidad: update.cantidad,
            precio: update.precio
          }
        })
      );
      operations.push(...updatePromises);
    }
    
    // Crear nuevos items de stock
    if (newStockItems && newStockItems.length > 0) {
      // Verificar que los colores existan
      const colorIds = newStockItems.map(item => item.color_id);
      const existingColors = await prisma.colores.findMany({
        where: { id: { in: colorIds } }
      });
      
      if (existingColors.length !== colorIds.length) {
        throw new Error('Algunos colores seleccionados no existen');
      }
      
      // Verificar que no existan duplicados
      const existingStock = await prisma.stock_detalle.findMany({
        where: {
          producto_id: parseInt(id),
          color_id: { in: colorIds }
        }
      });
      
      if (existingStock.length > 0) {
        const duplicateColors = existingStock.map(stock => stock.color_id);
        throw new Error(`Ya existen variantes para algunos colores seleccionados: ${duplicateColors.join(', ')}`);
      }
      
      const createPromises = newStockItems.map(item =>
        prisma.stock_detalle.create({
          data: {
            producto_id: parseInt(id),
            color_id: item.color_id,
            cantidad: item.cantidad,
            precio: item.precio
          }
        })
      );
      operations.push(...createPromises);
    }
    
    if (operations.length === 0) {
      return NextResponse.json(
        { error: 'No hay cambios para aplicar' },
        { status: 400 }
      );
    }
    
    await Promise.all(operations);
    
    console.log('✅ Stock actualizado exitosamente');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Stock actualizado exitosamente',
      updatedCount: stockUpdates?.length || 0,
      createdCount: newStockItems?.length || 0
    });
  } catch (error) {
    console.error('❌ Error actualizando stock:', error);
    return NextResponse.json(
      { error: error.message || 'Error al actualizar el stock' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
