import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { executeWithRetry } from '@/lib/db-utils';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    console.log(`📦 Actualizando pedido ${id}:`, body);
    
    const { estado, notas, validado_por } = body;
    
    // Validar estado
    const estadosValidos = ['pendiente', 'pagado', 'validado', 'en_preparacion', 'enviado', 'entregado', 'cancelado'];
    if (estado && !estadosValidos.includes(estado)) {
      return NextResponse.json(
        { error: 'Estado no válido' },
        { status: 400 }
      );
    }

    const updatedOrder = await executeWithRetry(async () => {
      const updateData = {};
      
      if (estado) {
        updateData.estado = estado;
      }
      
      if (notas !== undefined) {
        updateData.notas = notas;
      }
      
      // Si se está validando una transferencia
      if (estado === 'validado' && validado_por) {
        updateData.fecha_validacion_transferencia = new Date();
        updateData.validado_por = validado_por;
      }
      
      return await prisma.ordenes.update({
        where: { id: parseInt(id) },
        data: updateData,
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
        }
      });
    });

    console.log(`✅ Pedido ${id} actualizado exitosamente`);

    return NextResponse.json({
      success: true,
      message: 'Pedido actualizado exitosamente',
      order: updatedOrder
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
    
    console.log(`📦 Obteniendo pedido ${id}...`);
    
    const order = await executeWithRetry(async () => {
      return await prisma.ordenes.findUnique({
        where: { id: parseInt(id) },
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
        }
      });
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      );
    }

    console.log(`✅ Pedido ${id} obtenido exitosamente`);

    return NextResponse.json({
      success: true,
      order: order
    });

  } catch (error) {
    console.error('❌ Error obteniendo pedido:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
