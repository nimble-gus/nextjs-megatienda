import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql-direct';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    // Obtener el producto con todas sus relaciones
    const productQuery = `
      SELECT 
        p.id,
        p.sku,
        p.nombre,
        p.descripcion,
        p.url_imagen,
        c.id as categoria_id,
        c.nombre as categoria_nombre
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.id = ?
    `;
    
    const stockQuery = `
      SELECT 
        s.id,
        s.cantidad,
        s.precio,
        co.id as color_id,
        co.nombre as color_nombre,
        co.codigo_hex
      FROM stock_detalle s
      LEFT JOIN colores co ON s.color_id = co.id
      WHERE s.producto_id = ?
    `;
    
    const imagesQuery = `
      SELECT url_imagen
      FROM imagenes_producto
      WHERE producto_id = ?
      ORDER BY id ASC
    `;
    
    // Ejecutar todas las consultas
    const [productResult, stockResult, imagesResult] = await Promise.all([
      executeQuery(productQuery, [id]),
      executeQuery(stockQuery, [id]),
      executeQuery(imagesQuery, [id])
    ]);
    
    if (!productResult || productResult.length === 0) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }
    
    const product = productResult[0];
    
    // Formatear los datos para el frontend
    const formattedProduct = {
      id: product.id,
      sku: product.sku,
      name: product.nombre,
      description: product.descripcion,
      category: product.categoria_nombre,
      categoryId: product.categoria_id,
      mainImage: product.url_imagen,
      images: imagesResult.map(img => img.url_imagen),
      colors: stockResult.map(stockItem => ({
        id: stockItem.color_id,
        name: stockItem.color_nombre,
        hex: stockItem.codigo_hex,
        stock: stockItem.cantidad,
        price: stockItem.precio,
        available: stockItem.cantidad > 0
      })),
      // Calcular precio mínimo y máximo
      minPrice: stockResult.length > 0 ? Math.min(...stockResult.map(s => s.precio)) : 0,
      maxPrice: stockResult.length > 0 ? Math.max(...stockResult.map(s => s.precio)) : 0,
      totalStock: stockResult.reduce((total, item) => total + item.cantidad, 0),
      hasStock: stockResult.some(item => item.cantidad > 0)
    };

    return NextResponse.json(formattedProduct);
  } catch (error) {
    console.error('Error obteniendo producto:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
