import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql-direct';

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
