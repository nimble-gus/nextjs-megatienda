import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// PATCH - Actualizar cantidad de un item del carrito
export async function PATCH(request, { params }) {
  try {
    const { itemId } = params;
    const { cantidad } = await request.json();
    
    if (!cantidad || cantidad < 1) {
      return NextResponse.json(
        { error: 'La cantidad debe ser mayor a 0' },
        { status: 400 }
      );
    }

    console.log('Actualizando cantidad del item:', { itemId, cantidad });

    // Configuración de conexión
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL no está configurada');
    }

    const url = new URL(databaseUrl);
    const connectionConfig = {
      host: url.hostname,
      port: parseInt(url.port) || 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.substring(1),
      connectTimeout: 10000,
      acquireTimeout: 10000,
      timeout: 10000,
      reconnect: false
    };

    // Crear conexión
    const connection = await mysql.createConnection(connectionConfig);

    try {
      // Primero obtener el item actual para verificar el stock
      const currentItemQuery = `
        SELECT 
          c.id,
          c.usuario_id,
          c.producto_id,
          c.color_id,
          c.cantidad,
          p.nombre as producto_nombre,
          p.sku as producto_sku,
          p.descripcion as producto_descripcion,
          p.url_imagen as producto_imagen,
          cat.id as categoria_id,
          cat.nombre as categoria_nombre,
          col.nombre as color_nombre,
          col.codigo_hex as color_hex,
          s.cantidad as stock_disponible,
          s.precio
        FROM carrito c
        LEFT JOIN productos p ON c.producto_id = p.id
        LEFT JOIN categorias cat ON p.categoria_id = cat.id
        LEFT JOIN colores col ON c.color_id = col.id
        LEFT JOIN stock_detalle s ON p.id = s.producto_id AND c.color_id = s.color_id
        WHERE c.id = ?
      `;
      
      const [currentItems] = await connection.query(currentItemQuery, [parseInt(itemId)]);

      if (currentItems.length === 0) {
        return NextResponse.json(
          { error: 'Item del carrito no encontrado' },
          { status: 404 }
        );
      }

      const currentItem = currentItems[0];
      const stockDisponible = currentItem.stock_disponible || 0;
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

      // Actualizar la cantidad
      const updateQuery = `
        UPDATE carrito 
        SET cantidad = ? 
        WHERE id = ?
      `;
      
      await connection.query(updateQuery, [parseInt(cantidad), parseInt(itemId)]);

      // Obtener el item actualizado
      const updatedItemQuery = `
        SELECT 
          c.id,
          c.cantidad,
          p.id as producto_id,
          p.nombre as producto_nombre,
          p.sku as producto_sku,
          p.descripcion as producto_descripcion,
          p.url_imagen as producto_imagen,
          cat.id as categoria_id,
          cat.nombre as categoria_nombre,
          col.id as color_id,
          col.nombre as color_nombre,
          col.codigo_hex as color_hex,
          s.cantidad as stock_disponible,
          s.precio
        FROM carrito c
        LEFT JOIN productos p ON c.producto_id = p.id
        LEFT JOIN categorias cat ON p.categoria_id = cat.id
        LEFT JOIN colores col ON c.color_id = col.id
        LEFT JOIN stock_detalle s ON p.id = s.producto_id AND c.color_id = s.color_id
        WHERE c.id = ?
      `;
      
      const [updatedItems] = await connection.query(updatedItemQuery, [parseInt(itemId)]);

      if (updatedItems.length === 0) {
        throw new Error('Error obteniendo item actualizado');
      }

      const updatedItem = updatedItems[0];

      // Formatear la respuesta
      const formattedItem = {
        id: updatedItem.id,
        cantidad: updatedItem.cantidad,
        precio: updatedItem.precio,
        stockDisponible: updatedItem.stock_disponible,
        producto: {
          id: updatedItem.producto_id,
          nombre: updatedItem.producto_nombre,
          sku: updatedItem.producto_sku,
          descripcion: updatedItem.producto_descripcion,
          url_imagen: updatedItem.producto_imagen,
          categoria: {
            id: updatedItem.categoria_id,
            nombre: updatedItem.categoria_nombre
          }
        },
        color: {
          id: updatedItem.color_id,
          nombre: updatedItem.color_nombre,
          codigo_hex: updatedItem.color_hex
        }
      };

      console.log('Cantidad actualizada exitosamente');

      return NextResponse.json({
        success: true,
        item: formattedItem
      });

    } finally {
      await connection.end();
    }

  } catch (error) {
    console.error('❌ Error actualizando item del carrito:', error);
    console.error('Stack trace:', error.stack);
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
    
    console.log('Eliminando item del carrito:', { itemId });

    // Configuración de conexión
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL no está configurada');
    }

    const url = new URL(databaseUrl);
    const connectionConfig = {
      host: url.hostname,
      port: parseInt(url.port) || 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.substring(1),
      connectTimeout: 10000,
      acquireTimeout: 10000,
      timeout: 10000,
      reconnect: false
    };

    // Crear conexión
    const connection = await mysql.createConnection(connectionConfig);

    try {
      // Primero obtener el item para saber el usuario_id
      const itemQuery = `
        SELECT id, usuario_id 
        FROM carrito 
        WHERE id = ?
      `;
      
      const [items] = await connection.query(itemQuery, [parseInt(itemId)]);

      if (items.length === 0) {
        return NextResponse.json(
          { error: 'Item del carrito no encontrado' },
          { status: 404 }
        );
      }

      const item = items[0];

      // Eliminar el item
      const deleteQuery = `
        DELETE FROM carrito 
        WHERE id = ?
      `;
      
      await connection.query(deleteQuery, [parseInt(itemId)]);

      console.log('Item eliminado exitosamente');

      return NextResponse.json({
        success: true,
        message: 'Item eliminado exitosamente'
      });

    } finally {
      await connection.end();
    }

  } catch (error) {
    console.error('❌ Error eliminando item del carrito:', error);
    console.error('Stack trace:', error.stack);
    return NextResponse.json(
      { 
        error: 'Error al eliminar el item del carrito',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
