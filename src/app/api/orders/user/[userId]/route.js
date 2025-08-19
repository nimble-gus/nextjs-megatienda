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
      console.log('🔍 Buscando pedidos para usuario:', userId);
      
      // Primero, verificar si el usuario existe
      const userExists = await prisma.usuarios.findUnique({
        where: { id: parseInt(userId) }
      });
      
      if (!userExists) {
        console.log('❌ Usuario no encontrado:', userId);
        return [];
      }
      
      console.log('✅ Usuario encontrado:', userExists.nombre);
      
      // Buscar pedidos del usuario
      const orders = await prisma.ordenes.findMany({
        where: {
          usuario_id: parseInt(userId)
        },
        include: {
          detalle: {
            include: {
              producto: true,
              color: true
            }
          }
        },
        orderBy: {
          fecha: 'desc'
        }
      });
      
      console.log('📦 Pedidos encontrados:', orders.length);
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
             detalles: order.detalle.map(detalle => ({
        id: detalle.id,
        cantidad: detalle.cantidad,
        precio_unitario: detalle.precio_unitario,
                 producto: {
           id: detalle.producto.id,
           nombre: detalle.producto.nombre,
           imagenes: []
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
