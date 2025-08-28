import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma-production';
import { executeWithRetry } from '@/lib/db-utils';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const paymentMethod = searchParams.get('paymentMethod');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const skip = (page - 1) * limit;

    // Construir filtros
    let where = {};
    
    if (status && status !== 'all') {
      where.estado = status;
    }
    
    if (paymentMethod && paymentMethod !== 'all') {
      where.metodo_pago = paymentMethod;
    }
    
    if (search && search.trim() !== '') {
      where.codigo_orden = {
        contains: search.trim()
      };
    }

    const orders = await executeWithRetry(async () => {
      return await prisma.ordenes.findMany({
        where,
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              correo: true
            }
          },
          detalle: {
            include: {
              producto: {
                select: {
                  id: true,
                  nombre: true,
                  imagenes: {
                    select: {
                      url_imagen: true
                    }
                  }
                }
              },
              color: {
                select: {
                  id: true,
                  nombre: true,
                  codigo_hex: true
                }
              }
            }
          }
        },
        orderBy: {
          fecha: 'desc'
        },
        skip,
        take: limit
      });
    });

    // Contar total de pedidos para paginación
    const totalOrders = await executeWithRetry(async () => {
      return await prisma.ordenes.count({ where });
    });

    // Formatear los datos para el frontend
    const formattedOrders = orders.map(order => ({
      id: order.id,
      codigo_orden: order.codigo_orden,
      fecha: order.fecha,
      estado: order.estado,
      metodo_pago: order.metodo_pago,
      total: order.total,
      subtotal: order.subtotal,
      costo_envio: order.costo_envio,
      
      // Datos del cliente
      cliente: {
        nombre: order.usuario?.nombre || order.nombre_cliente,
        email: order.usuario?.correo || order.email_cliente,
        telefono: order.telefono_cliente,
        direccion: order.direccion_cliente,
        municipio: order.municipio_cliente,
        nit: order.nit_cliente
      },
      
      // Nombre de quien recibe
      nombre_quien_recibe: order.nombre_quien_recibe,
      
      // Para transferencias
      comprobante_transferencia: order.comprobante_transferencia,
      fecha_validacion_transferencia: order.fecha_validacion_transferencia,
      validado_por: order.validado_por,
      
      // Productos
      productos: order.detalle.map(detalle => ({
        id: detalle.id,
        cantidad: detalle.cantidad,
        precio_unitario: detalle.precio_unitario,
        producto: {
          id: detalle.producto.id,
          nombre: detalle.producto.nombre,
          imagen: detalle.producto.imagenes[0]?.url_imagen || null
        },
        color: {
          id: detalle.color.id,
          nombre: detalle.color.nombre,
          hex: detalle.color.codigo_hex
        }
      })),
      
      // Notas
      notas: order.notas
    }));
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

  } catch (error) {
    console.error('❌ Error obteniendo pedidos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
