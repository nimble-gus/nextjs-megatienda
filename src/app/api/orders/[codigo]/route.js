import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET(request, { params }) {
  try {
    const { codigo } = params;

    if (!codigo) {
      return NextResponse.json(
        { error: 'Código de orden requerido' },
        { status: 400 }
      );
    }

    console.log('Obteniendo orden:', { codigo });

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
      // Buscar la orden por código
      const ordenQuery = `
        SELECT 
          o.id,
          o.codigo_orden,
          o.usuario_id,
          o.fecha,
          o.estado,
          o.total,
          o.direccion_cliente,
          o.telefono_cliente,
          o.email_cliente,
          o.metodo_pago,
          o.notas,
          u.nombre as usuario_nombre,
          u.apellido as usuario_apellido,
          u.correo as usuario_email
        FROM ordenes o
        LEFT JOIN usuarios u ON o.usuario_id = u.id
        WHERE o.codigo_orden = ?
      `;
      
      const [ordenes] = await connection.query(ordenQuery, [codigo]);

      if (ordenes.length === 0) {
        return NextResponse.json(
          { error: 'Orden no encontrada' },
          { status: 404 }
        );
      }

      const orden = ordenes[0];

      // Obtener detalles de la orden
      const detallesQuery = `
        SELECT 
          d.id,
          d.orden_id,
          d.producto_id,
          d.color_id,
          d.cantidad,
          d.precio_unitario,
          (d.cantidad * d.precio_unitario) as subtotal,
          p.nombre as producto_nombre,
          p.sku as producto_sku,
          p.descripcion as producto_descripcion,
          p.url_imagen as producto_imagen,
          cat.id as categoria_id,
          cat.nombre as categoria_nombre,
          col.nombre as color_nombre,
          col.codigo_hex as color_hex
        FROM orden_detalle d
        LEFT JOIN productos p ON d.producto_id = p.id
        LEFT JOIN categorias cat ON p.categoria_id = cat.id
        LEFT JOIN colores col ON d.color_id = col.id
        WHERE d.orden_id = ?
      `;
      
      const [detalles] = await connection.query(detallesQuery, [orden.id]);

      // Formatear la respuesta
      const ordenFormateada = {
        id: orden.id,
        codigo_orden: orden.codigo_orden,
        usuario_id: orden.usuario_id,
        fecha_orden: orden.fecha,
        estado: orden.estado,
        total: orden.total,
        direccion_envio: orden.direccion_cliente,
        telefono: orden.telefono_cliente,
        email: orden.email_cliente,
        metodo_pago: orden.metodo_pago,
        notas: orden.notas,
        usuario: {
          nombre: orden.usuario_nombre,
          apellido: orden.usuario_apellido,
          email: orden.usuario_email
        },
        detalle: detalles.map(detalle => ({
          id: detalle.id,
          orden_id: detalle.orden_id,
          producto_id: detalle.producto_id,
          color_id: detalle.color_id,
          cantidad: detalle.cantidad,
          precio_unitario: detalle.precio_unitario,
          subtotal: detalle.subtotal,
          producto: {
            id: detalle.producto_id,
            nombre: detalle.producto_nombre,
            sku: detalle.producto_sku,
            descripcion: detalle.producto_descripcion,
            url_imagen: detalle.producto_imagen,
            categoria: {
              id: detalle.categoria_id,
              nombre: detalle.categoria_nombre
            }
          },
          color: {
            id: detalle.color_id,
            nombre: detalle.color_nombre,
            codigo_hex: detalle.color_hex
          }
        }))
      };

      console.log('Orden obtenida exitosamente');

      return NextResponse.json({
        success: true,
        orden: ordenFormateada
      });

    } finally {
      await connection.end();
    }

  } catch (error) {
    console.error('❌ Error obteniendo orden:', error);
    console.error('Stack trace:', error.stack);
    
    return NextResponse.json(
      { error: 'Error interno del servidor al obtener la orden' },
      { status: 500 }
    );
  }
}
