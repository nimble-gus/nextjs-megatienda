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

    // Obtener el pedido actual para verificar si está siendo cancelado
    const currentOrder = await executeWithRetry(async () => {
      return await prisma.ordenes.findUnique({
        where: { id: parseInt(id) },
        include: {
          detalle: {
            include: {
              producto: {
                select: {
                  id: true,
                  nombre: true
                }
              },
              color: {
                select: {
                  id: true,
                  nombre: true
                }
              }
            }
          }
        }
      });
    });

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
      console.log(`🔄 Cancelando pedido ${id} - Regresando stock...`);
      
      for (const item of currentOrder.detalle) {
        try {
          // Validar que la cantidad sea válida
          if (item.cantidad <= 0) {
            console.warn(`⚠️ Cantidad inválida para ${item.producto.nombre}: ${item.cantidad}`);
            continue;
          }

          // Buscar el stock actual del producto y color
          const currentStock = await prisma.stock_detalle.findFirst({
            where: {
              producto_id: item.producto_id,
              color_id: item.color_id
            }
          });

          if (currentStock) {
            // Actualizar el stock sumando la cantidad del pedido cancelado
            const newQuantity = currentStock.cantidad + item.cantidad;
            
            await prisma.stock_detalle.update({
              where: { id: currentStock.id },
              data: { cantidad: newQuantity }
            });

            stockUpdates.push({
              producto: item.producto.nombre,
              color: item.color.nombre,
              cantidad: item.cantidad,
              stockAnterior: currentStock.cantidad,
              stockNuevo: newQuantity
            });

            console.log(`✅ Stock actualizado: ${item.producto.nombre} (${item.color.nombre}) +${item.cantidad} unidades (${currentStock.cantidad} → ${newQuantity})`);
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

      console.log(`📊 Stock regresado: ${stockUpdates.length} items actualizados, ${stockErrors.length} errores`);
      
      // Si hay errores de stock, agregarlos a la respuesta
      if (stockErrors.length > 0) {
        console.warn(`⚠️ Errores durante la actualización de stock:`, stockErrors);
      }
    }

    // Actualizar el pedido
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
