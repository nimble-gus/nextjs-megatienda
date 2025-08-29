import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET(request) {
  try {
    // Obtener parámetros de la URL
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const paymentMethod = searchParams.get('paymentMethod');
    const search = searchParams.get('search');
    const page = Math.max(1, parseInt(searchParams.get('page')) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit')) || 20));
    const skip = (page - 1) * limit;

    console.log('Parámetros recibidos:', { status, paymentMethod, search, page, limit, skip });

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
      // Construir filtros SQL
      let whereConditions = [];
      let queryParams = [];
      
      if (status && status !== 'all') {
        whereConditions.push('o.estado = ?');
        queryParams.push(status);
      }
      
      if (paymentMethod && paymentMethod !== 'all') {
        whereConditions.push('o.metodo_pago = ?');
        queryParams.push(paymentMethod);
      }
      
      if (search && search.trim() !== '') {
        whereConditions.push('o.codigo_orden LIKE ?');
        queryParams.push(`%${search.trim()}%`);
      }
      
      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // Consulta principal para obtener órdenes
      const ordersQuery = `
        SELECT 
          o.id,
          o.codigo_orden,
          o.fecha,
          o.estado,
          o.metodo_pago,
          o.total,
          o.subtotal,
          o.costo_envio,
          o.nombre_cliente,
          o.email_cliente,
          o.telefono_cliente,
          o.direccion_cliente,
          o.municipio_cliente,
          o.nit_cliente,
          o.nombre_quien_recibe,
          o.comprobante_transferencia,
          o.fecha_validacion_transferencia,
          o.validado_por,
          o.notas
        FROM ordenes o
        ${whereClause}
        ORDER BY o.fecha DESC
        LIMIT ${limit} OFFSET ${skip}
      `;
      
      console.log('Ejecutando consulta de órdenes...');
      const [orders] = await connection.query(ordersQuery, queryParams);
      console.log('Órdenes obtenidas:', orders.length);

      // Contar total de órdenes
      const countQuery = `
        SELECT COUNT(*) as total
        FROM ordenes o
        ${whereClause}
      `;
      
      const [countResult] = await connection.query(countQuery, queryParams);
      const totalOrders = countResult[0].total;
      console.log('Total de órdenes:', totalOrders);

      // Formatear las órdenes
      const formattedOrders = [];
      
      for (const order of orders) {
        try {
          // Obtener detalles de la orden
          const detailsQuery = `
            SELECT 
              od.id,
              od.cantidad,
              od.precio_unitario,
              p.nombre as producto_nombre,
              p.url_imagen as producto_imagen,
              co.nombre as color_nombre,
              co.codigo_hex
            FROM orden_detalle od
            LEFT JOIN productos p ON od.producto_id = p.id
            LEFT JOIN colores co ON od.color_id = co.id
            WHERE od.orden_id = ?
          `;
          
          const [details] = await connection.query(detailsQuery, [order.id]);
          
          formattedOrders.push({
            id: order.id,
            codigo_orden: order.codigo_orden,
            fecha: order.fecha,
            estado: order.estado,
            metodo_pago: order.metodo_pago,
            total: order.total,
            subtotal: order.subtotal,
            costo_envio: order.costo_envio,
            
            cliente: {
              nombre: order.nombre_cliente,
              email: order.email_cliente,
              telefono: order.telefono_cliente,
              direccion: order.direccion_cliente,
              municipio: order.municipio_cliente,
              nit: order.nit_cliente
            },
            
            nombre_quien_recibe: order.nombre_quien_recibe,
            comprobante_transferencia: order.comprobante_transferencia,
            fecha_validacion_transferencia: order.fecha_validacion_transferencia,
            validado_por: order.validado_por,
            
            productos: details.map(detalle => ({
              id: detalle.id,
              cantidad: detalle.cantidad,
              precio_unitario: detalle.precio_unitario,
              producto: {
                nombre: detalle.producto_nombre,
                imagen: detalle.producto_imagen
              },
              color: {
                nombre: detalle.color_nombre,
                hex: detalle.codigo_hex
              }
            })),
            
            notas: order.notas
          });
        } catch (detailError) {
          console.error(`Error procesando detalles de orden ${order.id}:`, detailError);
          
          // Agregar orden sin detalles si falla
          formattedOrders.push({
            id: order.id,
            codigo_orden: order.codigo_orden,
            fecha: order.fecha,
            estado: order.estado,
            metodo_pago: order.metodo_pago,
            total: order.total,
            subtotal: order.subtotal,
            costo_envio: order.costo_envio,
            
            cliente: {
              nombre: order.nombre_cliente,
              email: order.email_cliente,
              telefono: order.telefono_cliente,
              direccion: order.direccion_cliente,
              municipio: order.municipio_cliente,
              nit: order.nit_cliente
            },
            
            nombre_quien_recibe: order.nombre_quien_recibe,
            comprobante_transferencia: order.comprobante_transferencia,
            fecha_validacion_transferencia: order.fecha_validacion_transferencia,
            validado_por: order.validado_por,
            productos: [],
            notas: order.notas
          });
        }
      }

      console.log('Órdenes formateadas:', formattedOrders.length);

      return NextResponse.json({
        success: true,
        orders: formattedOrders,
        pagination: {
          page,
          limit,
          total: totalOrders,
          totalPages: Math.ceil(totalOrders / limit)
        }
      });

    } finally {
      await connection.end();
    }

  } catch (error) {
    console.error('❌ Error obteniendo pedidos:', error);
    console.error('Stack trace:', error.stack);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}
