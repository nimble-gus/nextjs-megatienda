import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET(request, { params }) {
  try {
    const { userId } = await params;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'ID de usuario requerido' },
        { status: 400 }
      );
    }

    console.log('Obteniendo órdenes para usuario:', userId);

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
      reconnect: false
    };

    // Crear conexión
    const connection = await mysql.createConnection(connectionConfig);

    try {
      // Primero, verificar si el usuario existe
      const [users] = await connection.query(
        'SELECT id FROM usuarios WHERE id = ?',
        [parseInt(userId)]
      );
      
      if (users.length === 0) {
        return NextResponse.json({
          success: true,
          orders: []
        });
      }

      // Buscar pedidos del usuario
      const ordersQuery = `
        SELECT 
          o.id,
          o.codigo_orden,
          o.fecha,
          o.estado,
          o.subtotal,
          o.costo_envio,
          o.total,
          o.metodo_pago,
          o.notas,
          o.nombre_cliente,
          o.email_cliente,
          o.telefono_cliente,
          o.direccion_cliente,
          o.municipio_cliente,
          o.codigo_postal_cliente,
          o.nit_cliente,
          o.nombre_quien_recibe
        FROM ordenes o
        WHERE o.usuario_id = ?
        ORDER BY o.fecha DESC
      `;

      const [orders] = await connection.query(ordersQuery, [parseInt(userId)]);
      
      console.log('Órdenes encontradas:', orders.length);

      // Formatear los datos para el frontend
      const formattedOrders = [];

      for (const order of orders) {
        try {
          // Obtener detalles de la orden
          const detailsQuery = `
            SELECT 
              od.id,
              od.cantidad,
              od.precio_unitario,
              p.id as producto_id,
              p.nombre as producto_nombre,
              p.url_imagen as producto_imagen,
              col.id as color_id,
              col.nombre as color_nombre,
              col.codigo_hex as color_hex
            FROM orden_detalle od
            LEFT JOIN productos p ON od.producto_id = p.id
            LEFT JOIN colores col ON od.color_id = col.id
            WHERE od.orden_id = ?
          `;

          const [details] = await connection.query(detailsQuery, [order.id]);

          // Obtener imágenes adicionales del producto
          const imagesQuery = `
            SELECT id, url_imagen
            FROM imagenes_producto
            WHERE producto_id = ?
          `;

          const [images] = await connection.query(imagesQuery, [details[0]?.producto_id]);

          formattedOrders.push({
            id: order.id,
            codigo_orden: order.codigo_orden,
            fecha_creacion: order.fecha,
            estado: order.estado,
            subtotal: order.subtotal,
            costo_envio: order.costo_envio,
            total: order.total,
            metodo_pago: order.metodo_pago,
            notas: order.notas,
            // Información del cliente
            nombre_cliente: order.nombre_cliente,
            email_cliente: order.email_cliente,
            telefono_cliente: order.telefono_cliente,
            direccion_cliente: order.direccion_cliente,
            municipio_cliente: order.municipio_cliente,
            codigo_postal_cliente: order.codigo_postal_cliente,
            nit_cliente: order.nit_cliente,
            nombre_quien_recibe: order.nombre_quien_recibe,
            detalles: details.map(detalle => ({
              id: detalle.id,
              cantidad: detalle.cantidad,
              precio_unitario: detalle.precio_unitario,
              producto: {
                id: detalle.producto_id,
                nombre: detalle.producto_nombre,
                imagenes: [
                  // Imagen principal
                  { id: 0, url: detalle.producto_imagen },
                  // Imágenes adicionales
                  ...images.map(img => ({
                    id: img.id,
                    url: img.url_imagen
                  }))
                ].filter(img => img.url) // Filtrar imágenes vacías
              },
              color: {
                id: detalle.color_id,
                nombre: detalle.color_nombre,
                hex: detalle.color_hex
              }
            }))
          });
        } catch (detailError) {
          console.error(`Error procesando detalles de orden ${order.id}:`, detailError);
          
          // Agregar orden sin detalles si falla
          formattedOrders.push({
            id: order.id,
            codigo_orden: order.codigo_orden,
            fecha_creacion: order.fecha,
            estado: order.estado,
            subtotal: order.subtotal,
            costo_envio: order.costo_envio,
            total: order.total,
            metodo_pago: order.metodo_pago,
            notas: order.notas,
            nombre_cliente: order.nombre_cliente,
            email_cliente: order.email_cliente,
            telefono_cliente: order.telefono_cliente,
            direccion_cliente: order.direccion_cliente,
            municipio_cliente: order.municipio_cliente,
            codigo_postal_cliente: order.codigo_postal_cliente,
            nit_cliente: order.nit_cliente,
            nombre_quien_recibe: order.nombre_quien_recibe,
            detalles: []
          });
        }
      }

      console.log('Órdenes formateadas:', formattedOrders.length);

      return NextResponse.json({
        success: true,
        orders: formattedOrders
      });

    } finally {
      await connection.end();
    }

  } catch (error) {
    console.error('❌ Error obteniendo pedidos del usuario:', error);
    console.error('Stack trace:', error.stack);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}
