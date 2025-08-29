import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { uploadToCloudinary } from '@/services/cloudinaryService';

export async function POST(request) {
  try {
    // Verificar si es FormData (archivo de transferencia) o JSON normal
    const contentType = request.headers.get('content-type');
    let body;
    let comprobanteFile = null;

    if (contentType && contentType.includes('multipart/form-data')) {
      // Es FormData con archivo
      const formData = await request.formData();
      const orderDataString = formData.get('orderData');
      body = JSON.parse(orderDataString);
      comprobanteFile = formData.get('comprobante_transferencia');
    } else {
      // Es JSON normal
      body = await request.json();
    }
    
    const {
      // Datos del cliente
      nombre_cliente,
      email_cliente,
      telefono_cliente,
      direccion_cliente,
      municipio_cliente,
      codigo_postal_cliente,
      nit_cliente,
      nombre_quien_recibe,
      
      // Datos de la orden
      productos,
      subtotal,
      costo_envio,
      total,
      metodo_pago,
      estado = 'pendiente',
      notas,
      
      // Usuario (opcional para guest checkout)
      usuario_id = null
    } = body;

    console.log('Creando orden para cliente:', nombre_cliente);

    // Validaciones básicas
    if (!productos || productos.length === 0) {
      return NextResponse.json(
        { error: 'No hay productos en la orden' },
        { status: 400 }
      );
    }

    if (!nombre_cliente || !email_cliente || !telefono_cliente) {
      return NextResponse.json(
        { error: 'Faltan datos del cliente requeridos' },
        { status: 400 }
      );
    }

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
      // Iniciar transacción
      await connection.beginTransaction();

      // Subir archivo de comprobante a Cloudinary si existe
      let comprobanteUrl = null;
      if (comprobanteFile) {
        try {
          const uploadResult = await uploadToCloudinary(comprobanteFile, 'comprobantes-transferencia');
          comprobanteUrl = uploadResult.secure_url;
        } catch (uploadError) {
          console.error('❌ Error subiendo comprobante a Cloudinary:', uploadError);
          throw new Error('Error al subir el comprobante de transferencia');
        }
      }
      
      // Generar código de orden único (solo letras y números)
      const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let codigoAleatorio = '';
      for (let i = 0; i < 9; i++) {
        codigoAleatorio += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
      }
      const codigo_orden = `ORD-${Date.now()}-${codigoAleatorio}`;
      
      // Crear la orden principal
      const orderQuery = `
        INSERT INTO ordenes (
          codigo_orden, usuario_id, nombre_cliente, email_cliente, 
          telefono_cliente, direccion_cliente, municipio_cliente, 
          codigo_postal_cliente, nit_cliente, nombre_quien_recibe,
          fecha, total, subtotal, costo_envio, metodo_pago, 
          estado, notas, comprobante_transferencia
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?)
      `;

      const orderParams = [
        codigo_orden, usuario_id, nombre_cliente, email_cliente,
        telefono_cliente, direccion_cliente, municipio_cliente,
        codigo_postal_cliente, nit_cliente, nombre_quien_recibe,
        total, subtotal, costo_envio, metodo_pago,
        estado, notas, comprobanteUrl
      ];

      const [orderResult] = await connection.query(orderQuery, orderParams);
      const ordenId = orderResult.insertId;

      console.log('Orden creada con ID:', ordenId);

      // Crear los detalles de la orden
      const detallesOrden = [];
      
      for (const producto of productos) {
        const productoId = producto.producto_id || producto.producto?.id || producto.id;
        const colorId = producto.color_id || producto.color?.id;
        const cantidad = producto.cantidad;

        // Verificar que el producto existe y tiene stock
        const stockQuery = `
          SELECT id, cantidad 
          FROM stock_detalle 
          WHERE producto_id = ? AND color_id = ? AND cantidad >= ?
        `;
        
        const [stockItems] = await connection.query(stockQuery, [productoId, colorId, cantidad]);
        
        if (stockItems.length === 0) {
          // Rollback: eliminar la orden si no hay stock
          await connection.rollback();
          
          const nombreProducto = producto.nombre || producto.producto?.nombre || `Producto ID ${productoId}`;
          return NextResponse.json(
            { error: `No hay suficiente stock para ${nombreProducto}` },
            { status: 400 }
          );
        }

        const stockItem = stockItems[0];

        // Crear el detalle de la orden
        const detailQuery = `
          INSERT INTO orden_detalle (orden_id, producto_id, color_id, cantidad, precio_unitario)
          VALUES (?, ?, ?, ?, ?)
        `;
        
        const [detailResult] = await connection.query(detailQuery, [
          ordenId, productoId, colorId, cantidad, producto.precio
        ]);

        // Actualizar el stock
        const updateStockQuery = `
          UPDATE stock_detalle 
          SET cantidad = cantidad - ? 
          WHERE id = ?
        `;
        
        await connection.query(updateStockQuery, [cantidad, stockItem.id]);

        detallesOrden.push({
          id: detailResult.insertId,
          orden_id: ordenId,
          producto_id: productoId,
          color_id: colorId,
          cantidad: cantidad,
          precio_unitario: producto.precio
        });
      }

      // Si es un usuario registrado, limpiar el carrito
      if (usuario_id) {
        const [deletedItems] = await connection.query(
          'DELETE FROM carrito WHERE usuario_id = ?',
          [usuario_id]
        );
        console.log('Items eliminados del carrito:', deletedItems.affectedRows);
      }

      // Confirmar transacción
      await connection.commit();

      // Obtener la orden completa con detalles
      const completeOrderQuery = `
        SELECT 
          o.*,
          od.id as detalle_id,
          od.cantidad,
          od.precio_unitario,
          p.nombre as producto_nombre,
          p.sku as producto_sku,
          p.url_imagen as producto_imagen,
          c.nombre as color_nombre,
          c.codigo_hex as color_hex
        FROM ordenes o
        LEFT JOIN orden_detalle od ON o.id = od.orden_id
        LEFT JOIN productos p ON od.producto_id = p.id
        LEFT JOIN colores c ON od.color_id = c.id
        WHERE o.id = ?
      `;

      const [orderDetails] = await connection.query(completeOrderQuery, [ordenId]);

      // Formatear la respuesta
      const ordenCompleta = {
        id: orderDetails[0].id,
        codigo_orden: orderDetails[0].codigo_orden,
        fecha: orderDetails[0].fecha,
        estado: orderDetails[0].estado,
        total: orderDetails[0].total,
        subtotal: orderDetails[0].subtotal,
        costo_envio: orderDetails[0].costo_envio,
        metodo_pago: orderDetails[0].metodo_pago,
        detalle: orderDetails.map(detail => ({
          id: detail.detalle_id,
          cantidad: detail.cantidad,
          precio_unitario: detail.precio_unitario,
          producto: {
            id: detail.producto_id,
            nombre: detail.producto_nombre,
            sku: detail.producto_sku,
            url_imagen: detail.producto_imagen
          },
          color: {
            id: detail.color_id,
            nombre: detail.color_nombre,
            codigo_hex: detail.color_hex
          }
        }))
      };

      console.log('Orden procesada exitosamente');

      return NextResponse.json({
        success: true,
        orden: ordenCompleta,
        mensaje: 'Orden creada exitosamente',
        newOrder: true
      });

    } catch (error) {
      // Rollback en caso de error
      await connection.rollback();
      throw error;
    } finally {
      await connection.end();
    }

  } catch (error) {
    console.error('❌ Error creando orden:', error);
    console.error('Stack trace:', error.stack);
    
    return NextResponse.json(
      { error: 'Error interno del servidor al procesar la orden', details: error.message },
      { status: 500 }
    );
  }
}
