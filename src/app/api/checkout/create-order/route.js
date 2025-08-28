import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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
      
      // Para transferencias (ya no se extrae de body, se maneja por separado)
      
      // Usuario (opcional para guest checkout)
      usuario_id = null
    } = body;

    // Debug: Log validation checks
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

    // Función para procesar el pedido
    const processOrder = async (orderData) => {
      const { body } = orderData;
      
      // Subir archivo de comprobante a Cloudinary si existe
      let comprobanteUrl = null;
      if (comprobanteFile) {
        try {
          const uploadResult = await uploadToCloudinary(comprobanteFile, 'comprobantes-transferencia');
          comprobanteUrl = uploadResult.secure_url;
        } catch (uploadError) {
          console.error('❌ Error subiendo comprobante a Cloudinary:', uploadError);
          console.error('❌ Stack trace:', uploadError.stack);
          throw new Error('Error al subir el comprobante de transferencia');
        }
      } else {
      }
      
      // Generar código de orden único
      const codigo_orden = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      // Crear la orden principal
      const orden = await prisma.ordenes.create({
      data: {
        codigo_orden,
        usuario_id,
        nombre_cliente,
        email_cliente,
        telefono_cliente,
        direccion_cliente,
        municipio_cliente,
        codigo_postal_cliente,
        nit_cliente,
        nombre_quien_recibe,
        fecha: new Date(),
        total,
        subtotal,
        costo_envio,
        metodo_pago,
        estado,
        notas,
        comprobante_transferencia: comprobanteUrl
      }
    });
      // Crear los detalles de la orden
      const detallesOrden = [];
      
      for (const producto of productos) {

      // Verificar que el producto existe y tiene stock
      const productoId = producto.producto_id || producto.producto?.id || producto.id;
      const colorId = producto.color_id || producto.color?.id;
      const cantidad = producto.cantidad;
      const stockItem = await prisma.stock_detalle.findFirst({
        where: {
          producto_id: productoId,
          color_id: colorId,
          cantidad: {
            gte: cantidad
          }
        }
      });
      if (!stockItem) {
        // Rollback: eliminar la orden si no hay stock
        await prisma.ordenes.delete({
          where: { id: orden.id }
        });
        
        const nombreProducto = producto.nombre || producto.producto?.nombre || `Producto ID ${producto.producto_id || producto.id}`;
        return NextResponse.json(
          { error: `No hay suficiente stock para ${nombreProducto}` },
          { status: 400 }
        );
      }

      // Crear el detalle de la orden
      const detalle = await prisma.orden_detalle.create({
        data: {
          orden_id: orden.id,
          producto_id: productoId,
          color_id: colorId,
          cantidad: cantidad,
          precio_unitario: producto.precio
        }
      });

      // Actualizar el stock
      await prisma.stock_detalle.update({
        where: { id: stockItem.id },
        data: {
          cantidad: stockItem.cantidad - producto.cantidad
        }
      });

      detallesOrden.push(detalle);
    }

      // Si es un usuario registrado, limpiar el carrito
      if (usuario_id) {
        const deletedItems = await prisma.carrito.deleteMany({
          where: { usuario_id }
        });
      } else {
      }

      // Obtener la orden completa con detalles
      const ordenCompleta = await prisma.ordenes.findUnique({
        where: { id: orden.id },
        include: {
          detalle: {
            include: {
              producto: true,
              color: true
            }
          }
        }
      });

      // Disparar evento de nueva orden creada para notificaciones en tiempo real
      
      
      return {
        success: true,
        orden: ordenCompleta,
        mensaje: 'Orden creada exitosamente',
        newOrder: true // Indicador de nueva orden
      };
    };

    // Procesar el pedido directamente
    const result = await processOrder({ body });
    
    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Error creando orden:', error);
    
    return NextResponse.json(
      { error: 'Error interno del servidor al procesar la orden' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
