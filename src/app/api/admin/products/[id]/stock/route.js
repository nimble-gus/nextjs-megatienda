import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql-direct';

// GET - Obtener stock detallado de un producto
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const stockQuery = `
      SELECT 
        s.id,
        s.producto_id,
        s.color_id,
        s.cantidad,
        s.precio,
        c.nombre as color_nombre,
        c.codigo_hex,
        p.nombre as producto_nombre
      FROM stock_detalle s
      LEFT JOIN colores c ON s.color_id = c.id
      LEFT JOIN productos p ON s.producto_id = p.id
      WHERE s.producto_id = ?
      ORDER BY s.id ASC
    `;
    
    const stockItems = await executeQuery(stockQuery, [id]);
    
    // Formatear la respuesta para que coincida con el formato esperado
    const formattedStockItems = stockItems.map(item => ({
      id: item.id,
      producto_id: item.producto_id,
      color_id: item.color_id,
      cantidad: item.cantidad,
      precio: item.precio,
      color: {
        id: item.color_id,
        nombre: item.color_nombre,
        codigo_hex: item.codigo_hex
      },
      producto: {
        id: item.producto_id,
        nombre: item.producto_nombre
      }
    }));

    return NextResponse.json(formattedStockItems);
  } catch (error) {
    console.error('Error obteniendo stock:', error);
    return NextResponse.json(
      { error: 'Error al obtener el stock del producto' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar stock de un producto
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { stockUpdates, newStockItems } = await request.json();
    
    // Actualizar items de stock existentes
    if (stockUpdates && stockUpdates.length > 0) {
      for (const update of stockUpdates) {
        const updateQuery = `
          UPDATE stock_detalle 
          SET cantidad = ?, precio = ?
          WHERE id = ?
        `;
        await executeQuery(updateQuery, [update.cantidad, update.precio, update.id]);
      }
    }
    
    // Crear nuevos items de stock
    if (newStockItems && newStockItems.length > 0) {
      // Verificar que los colores existan
      const colorIds = newStockItems.map(item => item.color_id);
      const colorIdsPlaceholders = colorIds.map(() => '?').join(',');
      const existingColorsQuery = `
        SELECT id FROM colores WHERE id IN (${colorIdsPlaceholders})
      `;
      const existingColors = await executeQuery(existingColorsQuery, colorIds);
      
      if (existingColors.length !== colorIds.length) {
        throw new Error('Algunos colores seleccionados no existen');
      }
      
      // Verificar que no existan duplicados
      const existingStockQuery = `
        SELECT color_id FROM stock_detalle 
        WHERE producto_id = ? AND color_id IN (${colorIdsPlaceholders})
      `;
      const existingStock = await executeQuery(existingStockQuery, [id, ...colorIds]);
      
      if (existingStock.length > 0) {
        const duplicateColors = existingStock.map(stock => stock.color_id);
        throw new Error(`Ya existen variantes para algunos colores seleccionados: ${duplicateColors.join(', ')}`);
      }
      
      // Crear nuevos items de stock
      for (const item of newStockItems) {
        const createQuery = `
          INSERT INTO stock_detalle (producto_id, color_id, cantidad, precio)
          VALUES (?, ?, ?, ?)
        `;
        await executeQuery(createQuery, [id, item.color_id, item.cantidad, item.precio]);
      }
    }
    
    if ((!stockUpdates || stockUpdates.length === 0) && (!newStockItems || newStockItems.length === 0)) {
      return NextResponse.json(
        { error: 'No hay cambios para aplicar' },
        { status: 400 }
      );
    }

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
  }
}
