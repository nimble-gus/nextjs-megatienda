import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql-direct';
import { notifyOrderProcessed } from '../../notifications/route';
import { CacheManager } from '@/lib/cache-manager';
import { sendOrderStatusUpdateEmail } from '@/lib/email';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { estado, notas, validado_por } = body;
    
    // Validar estado
    const estadosValidos = ['pendiente', 'pagado', 'validado', 'en_preparacion', 'enviado', 'entregado', 'cancelado'];
    if (estado && !estadosValidos.includes(estado)) {
      return NextResponse.json(
        { error: 'Estado no válido' },
        { status: 400 }
      );
    }

    // Obtener el pedido actual para verificar si está siendo cancelado
    const currentOrderQuery = `
      SELECT 
        o.id,
        o.estado,
        od.id as detalle_id,
        od.cantidad,
        od.producto_id,
        od.color_id,
        p.nombre as producto_nombre,
        co.nombre as color_nombre
      FROM ordenes o
      LEFT JOIN orden_detalle od ON o.id = od.orden_id
      LEFT JOIN productos p ON od.producto_id = p.id
      LEFT JOIN colores co ON od.color_id = co.id
      WHERE o.id = ?
    `;
    
    const currentOrderResult = await executeQuery(currentOrderQuery, [id]);
    
    if (!currentOrderResult || currentOrderResult.length === 0) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      );
    }
    
    // Formatear la orden actual
    const currentOrder = {
      id: currentOrderResult[0].id,
      estado: currentOrderResult[0].estado,
      detalle: currentOrderResult.map(row => ({
        id: row.detalle_id,
        cantidad: row.cantidad,
        producto_id: row.producto_id,
        color_id: row.color_id,
        producto: {
          id: row.producto_id,
          nombre: row.producto_nombre
        },
        color: {
          id: row.color_id,
          nombre: row.color_nombre
        }
      }))
    };

    if (!currentOrder) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si el pedido está siendo cancelado
    const isBeingCancelled = estado === 'cancelado' && currentOrder.estado !== 'cancelado';
    
    // Inicializar variables para stock
    let stockUpdates = [];
    let stockErrors = [];
    
    if (isBeingCancelled) {
      for (const item of currentOrder.detalle) {
        try {
          // Validar que la cantidad sea válida
          if (item.cantidad <= 0) {
            console.warn(`⚠️ Cantidad inválida para ${item.producto.nombre}: ${item.cantidad}`);
            continue;
          }

          // Buscar el stock actual del producto y color
          const currentStockQuery = `
            SELECT id, cantidad
            FROM stock_detalle
            WHERE producto_id = ? AND color_id = ?
          `;
          
          const currentStockResult = await executeQuery(currentStockQuery, [item.producto_id, item.color_id]);
          
          if (currentStockResult && currentStockResult.length > 0) {
            const currentStock = currentStockResult[0];
            // Actualizar el stock sumando la cantidad del pedido cancelado
            const newQuantity = currentStock.cantidad + item.cantidad;
            
            const updateStockQuery = `
              UPDATE stock_detalle
              SET cantidad = ?
              WHERE id = ?
            `;
            
            await executeQuery(updateStockQuery, [newQuantity, currentStock.id]);

            stockUpdates.push({
              producto: item.producto.nombre,
              color: item.color.nombre,
              cantidad: item.cantidad,
              stockAnterior: currentStock.cantidad,
              stockNuevo: newQuantity
            });

          } else {
            const errorMsg = `No se encontró stock para: ${item.producto.nombre} (${item.color.nombre})`;
            console.warn(`⚠️ ${errorMsg}`);
            stockErrors.push(errorMsg);
          }
        } catch (stockError) {
          const errorMsg = `Error actualizando stock para ${item.producto.nombre}: ${stockError.message}`;
          console.error(`❌ ${errorMsg}`);
          stockErrors.push(errorMsg);
        }
      }
      // Si hay errores de stock, agregarlos a la respuesta
      if (stockErrors.length > 0) {
        console.warn(`⚠️ Errores durante la actualización de stock:`, stockErrors);
      }
    }

    // Actualizar el pedido
    let updateFields = [];
    let updateValues = [];
    
    if (estado) {
      updateFields.push('estado = ?');
      updateValues.push(estado);
    }
    
    if (notas !== undefined) {
      updateFields.push('notas = ?');
      updateValues.push(notas);
    }
    
    // Si se está validando una transferencia
    if (estado === 'validado' && validado_por) {
      updateFields.push('fecha_validacion_transferencia = NOW()');
      updateFields.push('validado_por = ?');
      updateValues.push(validado_por);
    }
    
    if (updateFields.length > 0) {
      const updateOrderQuery = `
        UPDATE ordenes
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `;
      
      updateValues.push(id);
      await executeQuery(updateOrderQuery, updateValues);
    }
    
    // Obtener la orden actualizada
    const updatedOrderQuery = `
      SELECT 
        o.*,
        u.id as usuario_id,
        u.nombre as usuario_nombre,
        u.correo as usuario_correo
      FROM ordenes o
      LEFT JOIN usuarios u ON o.usuario_id = u.id
      WHERE o.id = ?
    `;
    
    const updatedOrderResult = await executeQuery(updatedOrderQuery, [id]);
    const updatedOrder = updatedOrderResult[0];

    // Enviar notificación en tiempo real si se cambió el estado
    if (estado) {
      try {
        notifyOrderProcessed({
          id: updatedOrder.id,
          codigo_orden: updatedOrder.codigo_orden,
          estado: updatedOrder.estado
        });
        console.log('📢 Notificación de orden procesada enviada');
      } catch (notificationError) {
        console.error('⚠️ Error enviando notificación de orden procesada:', notificationError);
        // No fallar la actualización por error de notificación
      }

      // Enviar email de notificación al cliente si hay email válido
      if (updatedOrder.email_cliente) {
        try {
          const emailResult = await sendOrderStatusUpdateEmail({
            orderId: updatedOrder.codigo_orden,
            customerEmail: updatedOrder.email_cliente,
            customerName: updatedOrder.nombre_cliente
          }, updatedOrder.estado);

          if (emailResult.success) {
            console.log('📧 Email de actualización de estado enviado exitosamente');
          } else {
            console.error('⚠️ Error enviando email de actualización:', emailResult.error);
          }
        } catch (emailError) {
          console.error('⚠️ Error enviando email de actualización de estado:', emailError);
          // No fallar la actualización por error de email
        }
      } else {
        console.log('⚠️ No se envió email de actualización: cliente sin email registrado');
      }
      
      // Limpiar caché relacionado con órdenes cuando se actualiza el estado
      try {
        await CacheManager.invalidatePattern('megatienda:orders:*');
        await CacheManager.invalidatePattern('megatienda:sales:*');
        await CacheManager.invalidatePattern('megatienda:kpis:*');
        console.log('✅ Caché de órdenes limpiado después de actualización');
      } catch (cacheError) {
        console.error('⚠️ Error limpiando caché:', cacheError);
        // No fallar la actualización por error de caché
      }
    }

    return NextResponse.json({
      success: true,
      message: isBeingCancelled 
        ? 'Pedido cancelado exitosamente. Stock regresado al inventario.' 
        : 'Pedido actualizado exitosamente',
      order: updatedOrder,
      stockUpdated: isBeingCancelled,
      stockUpdates: isBeingCancelled ? stockUpdates : undefined,
      stockErrors: isBeingCancelled && stockErrors.length > 0 ? stockErrors : undefined
    });

  } catch (error) {
    console.error('❌ Error actualizando pedido:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    // Obtener la orden con detalles
    const orderQuery = `
      SELECT 
        o.*,
        u.id as usuario_id,
        u.nombre as usuario_nombre,
        u.correo as usuario_correo
      FROM ordenes o
      LEFT JOIN usuarios u ON o.usuario_id = u.id
      WHERE o.id = ?
    `;
    
    const orderResult = await executeQuery(orderQuery, [id]);
    
    if (!orderResult || orderResult.length === 0) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      );
    }
    
    const order = orderResult[0];
    
    // Obtener detalles de la orden
    const detailsQuery = `
      SELECT 
        od.id,
        od.cantidad,
        od.precio_unitario,
        p.id as producto_id,
        p.nombre as producto_nombre,
        p.url_imagen as producto_imagen,
        co.id as color_id,
        co.nombre as color_nombre,
        co.codigo_hex
      FROM orden_detalle od
      LEFT JOIN productos p ON od.producto_id = p.id
      LEFT JOIN colores co ON od.color_id = co.id
      WHERE od.orden_id = ?
    `;
    
    const details = await executeQuery(detailsQuery, [id]);
    
    // Formatear la respuesta
    const formattedOrder = {
      ...order,
      usuario: {
        id: order.usuario_id,
        nombre: order.usuario_nombre,
        correo: order.usuario_correo
      },
      detalle: details.map(detalle => ({
        id: detalle.id,
        cantidad: detalle.cantidad,
        precio_unitario: detalle.precio_unitario,
        producto: {
          id: detalle.producto_id,
          nombre: detalle.producto_nombre,
          imagenes: detalle.producto_imagen ? [{ url_imagen: detalle.producto_imagen }] : []
        },
        color: {
          id: detalle.color_id,
          nombre: detalle.color_nombre,
          codigo_hex: detalle.codigo_hex
        }
      }))
    };
    
    return NextResponse.json({
      success: true,
      order: formattedOrder
    });

  } catch (error) {
    console.error('❌ Error obteniendo pedido:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar una orden completamente
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
    console.log(`🗑️ Eliminando orden ID: ${id}`);
    
    // Verificar que la orden existe
    const orderExistsQuery = `SELECT id, codigo_orden, estado FROM ordenes WHERE id = ?`;
    const orderExists = await executeQuery(orderExistsQuery, [id]);
    
    if (!orderExists || orderExists.length === 0) {
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      );
    }
    
    const order = orderExists[0];
    console.log(`📋 Orden a eliminar: ${order.codigo_orden} (Estado: ${order.estado})`);
    
    // Si la orden no está cancelada, regresar el stock antes de eliminar
    if (order.estado !== 'cancelado') {
      console.log('📦 Regresando stock antes de eliminar...');
      
      // Obtener detalles de la orden
      const orderDetailsQuery = `
        SELECT 
          od.cantidad,
          od.producto_id,
          od.color_id,
          p.nombre as producto_nombre,
          c.nombre as color_nombre
        FROM orden_detalle od
        LEFT JOIN productos p ON od.producto_id = p.id
        LEFT JOIN colores c ON od.color_id = c.id
        WHERE od.orden_id = ?
      `;
      
      const orderDetails = await executeQuery(orderDetailsQuery, [id]);
      
      // Regresar stock para cada item
      for (const item of orderDetails) {
        const stockQuery = `
          SELECT id, cantidad
          FROM stock_detalle
          WHERE producto_id = ? AND color_id = ?
        `;
        
        const stockResult = await executeQuery(stockQuery, [item.producto_id, item.color_id]);
        
        if (stockResult && stockResult.length > 0) {
          const currentStock = stockResult[0];
          const newQuantity = currentStock.cantidad + item.cantidad;
          
          const updateStockQuery = `
            UPDATE stock_detalle
            SET cantidad = ?
            WHERE id = ?
          `;
          
          await executeQuery(updateStockQuery, [newQuantity, currentStock.id]);
          console.log(`✅ Stock regresado: ${item.producto_nombre} (${item.color_nombre}): +${item.cantidad}`);
        }
      }
    }
    
    // Eliminar registros relacionados en el orden correcto
    console.log('🗑️ Eliminando registros relacionados...');
    
    // 1. Eliminar detalles de la orden
    const deleteOrderDetailsQuery = `DELETE FROM orden_detalle WHERE orden_id = ?`;
    await executeQuery(deleteOrderDetailsQuery, [id]);
    console.log('✅ Detalles de orden eliminados');
    
    // 2. Eliminar la orden principal
    const deleteOrderQuery = `DELETE FROM ordenes WHERE id = ?`;
    await executeQuery(deleteOrderQuery, [id]);
    console.log('✅ Orden eliminada');
    
    // 3. Limpiar caché relacionado con órdenes
    try {
      await CacheManager.invalidatePattern('megatienda:orders:*');
      await CacheManager.invalidatePattern('megatienda:sales:*');
      await CacheManager.invalidatePattern('megatienda:kpis:*');
      console.log('✅ Caché de órdenes limpiado');
    } catch (cacheError) {
      console.error('⚠️ Error limpiando caché:', cacheError);
      // No fallar la eliminación por error de caché
    }
    
    return NextResponse.json({
      success: true,
      message: `Orden ${order.codigo_orden} eliminada exitosamente`,
      deletedOrder: {
        id: order.id,
        codigo_orden: order.codigo_orden,
        estado: order.estado
      }
    });
    
  } catch (error) {
    console.error('❌ Error eliminando orden:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}
