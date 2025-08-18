import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

// POST - Agregar producto al carrito
export async function POST(request) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de autenticación requerido' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let decoded;
    
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    const { usuario_id, producto_id, color_id, cantidad } = await request.json();
    
    console.log('Agregando al carrito:', {
      usuario_id,
      producto_id,
      color_id,
      cantidad
    });

    // Validar que el usuario del token coincida con el usuario_id enviado
    if (decoded.id !== parseInt(usuario_id)) {
      return NextResponse.json(
        { error: 'No autorizado para modificar este carrito' },
        { status: 403 }
      );
    }

    // Validaciones
    if (!usuario_id || !producto_id || !color_id || !cantidad) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    if (cantidad < 1) {
      return NextResponse.json(
        { error: 'La cantidad debe ser mayor a 0' },
        { status: 400 }
      );
    }

    // Verificar si el producto existe y tiene stock
    const stockItem = await prisma.stock_detalle.findFirst({
      where: {
        producto_id: parseInt(producto_id),
        color_id: parseInt(color_id)
      }
    });

    if (!stockItem) {
      return NextResponse.json(
        { error: 'Producto o color no disponible' },
        { status: 404 }
      );
    }

    if (stockItem.cantidad < cantidad) {
      return NextResponse.json(
        { error: 'Stock insuficiente' },
        { status: 400 }
      );
    }

    // Verificar si ya existe el item en el carrito
    const existingCartItem = await prisma.carrito.findFirst({
      where: {
        usuario_id: parseInt(usuario_id),
        producto_id: parseInt(producto_id),
        color_id: parseInt(color_id)
      }
    });

    let cartItem;

    if (existingCartItem) {
      // Actualizar cantidad si ya existe
      const newQuantity = existingCartItem.cantidad + cantidad;
      
      if (stockItem.cantidad < newQuantity) {
        return NextResponse.json(
          { error: 'Stock insuficiente para la cantidad solicitada' },
          { status: 400 }
        );
      }

      cartItem = await prisma.carrito.update({
        where: {
          id: existingCartItem.id
        },
        data: {
          cantidad: newQuantity
        },
        include: {
          producto: {
            include: {
              categoria: true
            }
          },
          color: true
        }
      });

      console.log('Item actualizado en carrito:', cartItem.id);
    } else {
      // Crear nuevo item en el carrito
      cartItem = await prisma.carrito.create({
        data: {
          usuario_id: parseInt(usuario_id),
          producto_id: parseInt(producto_id),
          color_id: parseInt(color_id),
          cantidad: parseInt(cantidad)
        },
        include: {
          producto: {
            include: {
              categoria: true
            }
          },
          color: true
        }
      });

      console.log('Nuevo item agregado al carrito:', cartItem.id);
    }

    // Formatear la respuesta
    const formattedItem = {
      id: cartItem.id,
      cantidad: cartItem.cantidad,
      precio: stockItem.precio,
      producto: {
        id: cartItem.producto.id,
        nombre: cartItem.producto.nombre,
        sku: cartItem.producto.sku,
        descripcion: cartItem.producto.descripcion,
        url_imagen: cartItem.producto.url_imagen,
        categoria: cartItem.producto.categoria
      },
      color: {
        id: cartItem.color.id,
        nombre: cartItem.color.nombre,
        codigo_hex: cartItem.color.codigo_hex
      }
    };

    return NextResponse.json({
      success: true,
      message: existingCartItem ? 'Cantidad actualizada en el carrito' : 'Producto agregado al carrito',
      item: formattedItem
    });

  } catch (error) {
    console.error('Error agregando al carrito:', error);
    return NextResponse.json(
      { 
        error: 'Error al agregar al carrito',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
