import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql-direct';

// GET - Obtener un producto específico
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const productQuery = `
      SELECT 
        p.id,
        p.sku,
        p.nombre,
        p.descripcion,
        p.url_imagen,
        p.featured,
        c.nombre as categoria_nombre,
        COALESCE(SUM(s.cantidad), 0) as total_stock,
        COALESCE(MIN(s.precio), 0) as min_price
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      LEFT JOIN stock_detalle s ON p.id = s.producto_id
      WHERE p.id = ?
      GROUP BY p.id, p.sku, p.nombre, p.descripcion, p.url_imagen, p.featured, c.nombre
    `;
    
    const productResult = await executeQuery(productQuery, [id]);
    
    if (!productResult || productResult.length === 0) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }
    
    const product = productResult[0];
    
    // Formatear el producto
    const formattedProduct = {
      id: product.id,
      sku: product.sku,
      nombre: product.nombre,
      descripcion: product.descripcion,
      url_imagen: product.url_imagen,
      categoria: product.categoria_nombre || 'Sin categoría',
      featured: product.featured,
      stock: product.total_stock,
      precio: product.min_price > 0 ? product.min_price : null
    };
    
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
    
    // Buscar la categoría por nombre si se proporciona
    let categoriaId = null;
    if (body.categoria) {
      const categoriaQuery = `
        SELECT id FROM categorias WHERE nombre = ?
      `;
      const categoriaResult = await executeQuery(categoriaQuery, [body.categoria]);
      categoriaId = categoriaResult[0]?.id;
    }
    
    // Construir la consulta de actualización
    let updateFields = [];
    let updateValues = [];
    
    if (body.nombre) {
      updateFields.push('nombre = ?');
      updateValues.push(body.nombre);
    }
    
    if (body.descripcion) {
      updateFields.push('descripcion = ?');
      updateValues.push(body.descripcion);
    }
    
    if (body.url_imagen) {
      updateFields.push('url_imagen = ?');
      updateValues.push(body.url_imagen);
    }
    
    if (body.featured !== undefined) {
      updateFields.push('featured = ?');
      updateValues.push(body.featured);
    }
    
    if (categoriaId) {
      updateFields.push('categoria_id = ?');
      updateValues.push(categoriaId);
    }
    
    if (updateFields.length > 0) {
      updateValues.push(id);
      const updateQuery = `
        UPDATE productos 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `;
      
      await executeQuery(updateQuery, updateValues);
    }
    
    // Obtener el producto actualizado
    const updatedProductQuery = `
      SELECT 
        p.id,
        p.sku,
        p.nombre,
        p.descripcion,
        p.url_imagen,
        p.featured,
        c.nombre as categoria_nombre
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.id = ?
    `;
    
    const updatedProductResult = await executeQuery(updatedProductQuery, [id]);
    const updatedProduct = updatedProductResult[0];
    
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
    
    // Verificar que el producto existe
    const productQuery = `SELECT id FROM productos WHERE id = ?`;
    const productResult = await executeQuery(productQuery, [id]);
    
    if (!productResult || productResult.length === 0) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }
    
    // Eliminar registros relacionados en el orden correcto
    // 1. Eliminar detalles de órdenes (orden_detalle)
    const deletedOrderDetailsQuery = `DELETE FROM orden_detalle WHERE producto_id = ?`;
    const deletedOrderDetailsResult = await executeQuery(deletedOrderDetailsQuery, [id]);
    
    // 2. Eliminar stock
    const deletedStockQuery = `DELETE FROM stock_detalle WHERE producto_id = ?`;
    const deletedStockResult = await executeQuery(deletedStockQuery, [id]);
    
    // 3. Eliminar imágenes del producto
    const deletedImagesQuery = `DELETE FROM imagenes_producto WHERE producto_id = ?`;
    const deletedImagesResult = await executeQuery(deletedImagesQuery, [id]);
    
    // 4. Eliminar del carrito
    const deletedCartQuery = `DELETE FROM carrito WHERE producto_id = ?`;
    const deletedCartResult = await executeQuery(deletedCartQuery, [id]);
    
    // 5. Eliminar productos destacados
    const deletedFeaturedQuery = `DELETE FROM productos_destacados WHERE producto_id = ?`;
    const deletedFeaturedResult = await executeQuery(deletedFeaturedQuery, [id]);
    
    // 6. Finalmente eliminar el producto
    const deletedProductQuery = `DELETE FROM productos WHERE id = ?`;
    await executeQuery(deletedProductQuery, [id]);

    return NextResponse.json({ 
      message: 'Producto eliminado exitosamente',
      deleted: {
        orderDetails: deletedOrderDetailsResult.affectedRows || 0,
        stock: deletedStockResult.affectedRows || 0,
        images: deletedImagesResult.affectedRows || 0,
        cart: deletedCartResult.affectedRows || 0,
        featured: deletedFeaturedResult.affectedRows || 0
      }
    });
  } catch (error) {
    console.error(`=== ERROR EN DELETE /api/admin/products/${params?.id} ===`);
    console.error('Error completo:', error);
    
    return NextResponse.json(
      { error: 'Error al eliminar el producto', details: error.message },
      { status: 500 }
    );
  }
}
