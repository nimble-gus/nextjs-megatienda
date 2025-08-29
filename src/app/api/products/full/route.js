import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql-direct';

export async function POST(req) {
  try {
    const { sku, nombre, descripcion, url_imagen, categoria_id, stock, imagenes_adicionales } = await req.json();
    
    // Crear el producto principal
    const insertProductQuery = `
      INSERT INTO productos (sku, nombre, descripcion, url_imagen, categoria_id)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const productParams = [sku, nombre, descripcion, url_imagen, categoria_id];
    const productResult = await executeQuery(insertProductQuery, productParams);
    const productId = productResult.insertId;
    
    // Crear el stock para cada color
    if (stock && stock.length > 0) {
      const stockQueries = stock.map(s => {
        const stockQuery = `
          INSERT INTO stock_detalle (producto_id, color_id, cantidad, precio)
          VALUES (?, ?, ?, ?)
        `;
        return executeQuery(stockQuery, [productId, s.color_id, s.cantidad, s.precio]);
      });
      
      await Promise.all(stockQueries);
    }
    
    // Si hay imágenes adicionales, guardarlas en la tabla imagenes_producto
    if (imagenes_adicionales && imagenes_adicionales.length > 0) {
      const imageQueries = imagenes_adicionales.map(url => {
        const imageQuery = `
          INSERT INTO imagenes_producto (producto_id, url_imagen)
          VALUES (?, ?)
        `;
        return executeQuery(imageQuery, [productId, url]);
      });
      
      await Promise.all(imageQueries);
    }
    
    return NextResponse.json({ 
      message: 'Producto, stock e imágenes creados correctamente', 
      productId: productId,
      imagenesGuardadas: imagenes_adicionales ? imagenes_adicionales.length : 0
    });
    
  } catch (error) {
    console.error('=== ERROR EN API /api/products/full ===');
    console.error('Error completo:', error);
    
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error.message 
    }, { status: 500 });
  }
}
