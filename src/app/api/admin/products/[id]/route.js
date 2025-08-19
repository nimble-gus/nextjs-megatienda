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
  } finally {
    await prisma.$disconnect();
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
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Eliminar un producto
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    console.log(`=== DELETE /api/admin/products/${id} ===`);
    
    // Verificar que el producto existe
    const product = await prisma.productos.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!product) {
      console.log(`Producto con ID ${id} no encontrado`);
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }
    
    // Eliminar registros relacionados en el orden correcto
    console.log('Eliminando registros relacionados...');
    
    // 1. Eliminar detalles de órdenes (orden_detalle)
    const deletedOrderDetails = await prisma.orden_detalle.deleteMany({
      where: { producto_id: parseInt(id) }
    });
    console.log(`Eliminados ${deletedOrderDetails.count} detalles de órdenes`);
    
    // 2. Eliminar stock
    const deletedStock = await prisma.stock_detalle.deleteMany({
      where: { producto_id: parseInt(id) }
    });
    console.log(`Eliminados ${deletedStock.count} registros de stock`);
    
    // 3. Eliminar imágenes del producto
    const deletedImages = await prisma.imagenes_producto.deleteMany({
      where: { producto_id: parseInt(id) }
    });
    console.log(`Eliminadas ${deletedImages.count} imágenes`);
    
    // 4. Eliminar del carrito
    const deletedCart = await prisma.carrito.deleteMany({
      where: { producto_id: parseInt(id) }
    });
    console.log(`Eliminados ${deletedCart.count} items del carrito`);
    
    // 5. Eliminar productos destacados
    const deletedFeatured = await prisma.productos_destacados.deleteMany({
      where: { producto_id: parseInt(id) }
    });
    console.log(`Eliminados ${deletedFeatured.count} productos destacados`);
    
    // 6. Finalmente eliminar el producto
    await prisma.productos.delete({
      where: { id: parseInt(id) }
    });

    console.log(`Producto ${id} eliminado exitosamente`);
    return NextResponse.json({ 
      message: 'Producto eliminado exitosamente',
      deleted: {
        orderDetails: deletedOrderDetails.count,
        stock: deletedStock.count,
        images: deletedImages.count,
        cart: deletedCart.count,
        featured: deletedFeatured.count
      }
    });
  } catch (error) {
    console.error(`=== ERROR EN DELETE /api/admin/products/${params?.id} ===`);
    console.error('Error completo:', error);
    
    // Manejar errores específicos de Prisma
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'No se puede eliminar el producto porque tiene registros relacionados' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error al eliminar el producto', details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
