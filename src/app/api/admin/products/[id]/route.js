import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Obtener un producto específico
export async function GET(request, { params }) {
  try {
    const { id } = params;
    console.log(`=== GET /api/admin/products/${id} ===`);
    
    const product = await prisma.productos.findUnique({
      where: { id: parseInt(id) },
      include: {
        categoria: true,
        stock: {
          include: {
            color: true
          }
        }
      }
    });

    if (!product) {
      console.log(`Producto con ID ${id} no encontrado`);
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    // Formatear el producto
    const formattedProduct = {
      id: product.id,
      sku: product.sku,
      nombre: product.nombre,
      descripcion: product.descripcion,
      url_imagen: product.url_imagen,
      categoria: product.categoria?.nombre || 'Sin categoría',
      featured: product.featured,
      stock: product.stock.reduce((total, item) => total + item.cantidad, 0),
      precio: product.stock.length > 0 ? Math.min(...product.stock.map(s => s.precio)) : null
    };

    console.log(`Producto ${id} obtenido exitosamente`);
    return NextResponse.json(formattedProduct);
  } catch (error) {
    console.error(`=== ERROR EN GET /api/admin/products/${params?.id} ===`);
    console.error('Error completo:', error);
    return NextResponse.json(
      { error: 'Error al obtener el producto', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Actualizar un producto
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    console.log(`=== PUT /api/admin/products/${id} ===`);
    console.log('Datos recibidos:', body);
    
    // Buscar la categoría por nombre
    let categoriaId = null;
    if (body.categoria) {
      const categoria = await prisma.categorias.findFirst({
        where: { nombre: body.categoria }
      });
      categoriaId = categoria?.id;
    }
    
    const updateData = {
      nombre: body.nombre,
      descripcion: body.descripcion,
      url_imagen: body.url_imagen,
      featured: body.featured,
      ...(categoriaId && { categoria_id: categoriaId })
    };

    const updatedProduct = await prisma.productos.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        categoria: true
      }
    });

    console.log(`Producto ${id} actualizado exitosamente`);
    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error(`=== ERROR EN PUT /api/admin/products/${params?.id} ===`);
    console.error('Error completo:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el producto', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar un producto
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    console.log(`=== DELETE /api/admin/products/${id} ===`);
    
    // Primero eliminar registros relacionados
    await prisma.stock_detalle.deleteMany({
      where: { producto_id: parseInt(id) }
    });
    
    await prisma.imagenes_producto.deleteMany({
      where: { producto_id: parseInt(id) }
    });
    
    await prisma.carrito.deleteMany({
      where: { producto_id: parseInt(id) }
    });
    
    // Finalmente eliminar el producto
    await prisma.productos.delete({
      where: { id: parseInt(id) }
    });

    console.log(`Producto ${id} eliminado exitosamente`);
    return NextResponse.json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error(`=== ERROR EN DELETE /api/admin/products/${params?.id} ===`);
    console.error('Error completo:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el producto', details: error.message },
      { status: 500 }
    );
  }
}
