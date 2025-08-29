import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql-direct';

export async function GET() {
  try {
    // Obtener productos con categoría y stock usando SQL
    const productsQuery = `
      SELECT 
        p.id,
        p.sku,
        p.nombre,
        p.descripcion,
        p.url_imagen,
        p.featured,
        c.nombre as categoria_nombre,
        COALESCE(SUM(s.cantidad), 0) as total_stock,
        COALESCE(MIN(s.precio), 0) as min_price,
        COALESCE(MAX(s.precio), 0) as max_price
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      LEFT JOIN stock_detalle s ON p.id = s.producto_id
      GROUP BY p.id, p.sku, p.nombre, p.descripcion, p.url_imagen, p.featured, c.nombre
      ORDER BY p.id DESC
    `;
    
    const products = await executeQuery(productsQuery);
    
    // Formatear los productos para el admin
    const formattedProducts = products.map(product => {
      const hasStock = product.total_stock > 0;
      const minPrice = product.min_price || 0;
      const maxPrice = product.max_price || 0;

      return {
        id: product.id,
        sku: product.sku,
        nombre: product.nombre,
        descripcion: product.descripcion,
        url_imagen: product.url_imagen,
        categoria: product.categoria_nombre || 'Sin categoría',
        featured: product.featured,
        stock: product.total_stock,
        hasStock,
        minPrice,
        maxPrice,
        precio: minPrice > 0 ? minPrice : null
      };
    });
    
    return NextResponse.json(formattedProducts);
    
  } catch (error) {
    console.error('=== ERROR EN GET /api/admin/products ===');
    console.error('Error completo:', error);
    console.error('Stack trace:', error.stack);
    console.error('Mensaje:', error.message);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const productData = await request.json();
    
    // Crear el producto usando SQL
    const insertQuery = `
      INSERT INTO productos (sku, nombre, descripcion, url_imagen, categoria_id, featured)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const insertParams = [
      productData.sku,
      productData.nombre,
      productData.descripcion,
      productData.url_imagen,
      productData.categoria_id,
      productData.featured || false
    ];
    
    const result = await executeQuery(insertQuery, insertParams);
    
    // Obtener el producto creado
    const newProductQuery = `
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
    
    const newProduct = await executeQuery(newProductQuery, [result.insertId]);
    
    return NextResponse.json({
      success: true,
      product: newProduct[0],
      message: 'Producto creado exitosamente'
    });
    
  } catch (error) {
    console.error('=== ERROR EN POST /api/admin/products ===');
    console.error('Error completo:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Error interno del servidor',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
