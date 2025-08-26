import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { executeWithRetry } from '@/lib/db-utils';

export async function GET(request, { params }) {
  try {
    const { userId } = await params;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'ID de usuario requerido' },
        { status: 400 }
      );
    }

    const orders = await executeWithRetry(async () => {
      // Primero, verificar si el usuario existe
      const userExists = await prisma.usuarios.findUnique({
        where: { id: parseInt(userId) }
      });
      
      if (!userExists) {
        return [];
      }
      // Buscar pedidos del usuario
      const orders = await prisma.ordenes.findMany({
        where: {
          usuario_id: parseInt(userId)
        },
        include: {
          detalle: {
            include: {
              producto: {
                include: {
                  imagenes: true
                }
              },
              color: true
            }
          }
        },
        orderBy: {
          fecha: 'desc'
        }
      });
      return orders;
    });

    // Formatear los datos para el frontend
    const formattedOrders = orders.map(order => ({
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
      detalles: order.detalle.map(detalle => ({
        id: detalle.id,
        cantidad: detalle.cantidad,
        precio_unitario: detalle.precio_unitario,
        producto: {
          id: detalle.producto.id,
          nombre: detalle.producto.nombre,
          imagenes: detalle.producto.imagenes.map(img => ({
            id: img.id,
            url: img.url_imagen
          }))
        },
        color: {
          id: detalle.color.id,
          nombre: detalle.color.nombre,
          hex: detalle.color.codigo_hex
        }
      }))
    }));

    return NextResponse.json({
      success: true,
      orders: formattedOrders
    });

  } catch (error) {
    console.error('Error obteniendo pedidos del usuario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
