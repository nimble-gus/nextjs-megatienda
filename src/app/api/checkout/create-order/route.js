import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Debug: Log the received data
    console.log('📥 Datos recibidos en la API:', JSON.stringify(body, null, 2));
    
    const {
      // Datos del cliente
      nombre_cliente,
      email_cliente,
      telefono_cliente,
      direccion_cliente,
      ciudad_cliente,
      codigo_postal_cliente,
      nit_cliente,
      
      // Datos de la orden
      productos,
      subtotal,
      costo_envio,
      total,
      metodo_pago,
      estado = 'pendiente',
      notas,
      
      // Para transferencias
      comprobante_transferencia,
      
      // Usuario (opcional para guest checkout)
      usuario_id = null
    } = body;

    // Debug: Log validation checks
    console.log('🔍 Validaciones:');
    console.log('- Productos:', productos ? productos.length : 'undefined');
    console.log('- Nombre cliente:', nombre_cliente);
    console.log('- Email cliente:', email_cliente);
    console.log('- Teléfono cliente:', telefono_cliente);

    // Validaciones básicas
    if (!productos || productos.length === 0) {
      console.log('❌ Error: No hay productos en la orden');
      return NextResponse.json(
        { error: 'No hay productos en la orden' },
        { status: 400 }
      );
    }

    if (!nombre_cliente || !email_cliente || !telefono_cliente) {
      console.log('❌ Error: Faltan datos del cliente');
      console.log('- nombre_cliente:', nombre_cliente);
      console.log('- email_cliente:', email_cliente);
      console.log('- telefono_cliente:', telefono_cliente);
      return NextResponse.json(
        { error: 'Faltan datos del cliente requeridos' },
        { status: 400 }
      );
    }

    // Generar código de orden único
    const codigo_orden = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    console.log('✅ Creando orden con código:', codigo_orden);

    // Crear la orden principal
    const orden = await prisma.ordenes.create({
      data: {
        codigo_orden,
        usuario_id,
        nombre_cliente,
        email_cliente,
        telefono_cliente,
        direccion_cliente,
        ciudad_cliente,
        codigo_postal_cliente,
        nit_cliente,
        fecha: new Date(),
        total,
        subtotal,
        costo_envio,
        metodo_pago,
        estado,
        notas,
        comprobante_transferencia
      }
    });

    console.log('✅ Orden creada:', orden.id);

    // Crear los detalles de la orden
    const detallesOrden = [];
    
    for (const producto of productos) {
      console.log('🔍 Procesando producto:', JSON.stringify(producto, null, 2));
      console.log('🔍 Estructura del producto:');
      console.log('- producto_id:', producto.producto_id);
      console.log('- id:', producto.id);
      console.log('- color_id:', producto.color_id);
      console.log('- color.id:', producto.color?.id);
      console.log('- cantidad:', producto.cantidad);
      console.log('- precio:', producto.precio);
      console.log('- nombre:', producto.nombre);
      
      // Verificar que el producto existe y tiene stock
      const productoId = producto.producto_id || producto.producto?.id || producto.id;
      const colorId = producto.color_id || producto.color?.id;
      const cantidad = producto.cantidad;
      
      console.log('🔍 Buscando stock con:', {
        producto_id: productoId,
        color_id: colorId,
        cantidad: cantidad
      });
      
      const stockItem = await prisma.stock_detalle.findFirst({
        where: {
          producto_id: productoId,
          color_id: colorId,
          cantidad: {
            gte: cantidad
          }
        }
      });
      
      console.log('🔍 Resultado de búsqueda de stock:', stockItem);

      if (!stockItem) {
        console.log('❌ No hay stock para producto:', producto);
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
      console.log('✅ Detalle creado:', detalle.id);
    }

    // Si es un usuario registrado, limpiar el carrito
    if (usuario_id) {
      await prisma.carrito.deleteMany({
        where: { usuario_id }
      });
      console.log('✅ Carrito limpiado para usuario:', usuario_id);
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

    console.log('✅ Orden procesada exitosamente:', orden.codigo_orden);

    return NextResponse.json({
      success: true,
      orden: ordenCompleta,
      mensaje: 'Orden creada exitosamente'
    });

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
