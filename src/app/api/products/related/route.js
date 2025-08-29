import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const excludeId = searchParams.get('excludeId');
    const limit = parseInt(searchParams.get('limit')) || 4;

    if (!categoryId) {
      return NextResponse.json(
        { error: 'categoryId es requerido' },
        { status: 400 }
      );
    }

    console.log('Obteniendo productos relacionados para categoría:', categoryId);

    // Configuración de conexión
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL no está configurada');
    }

    const url = new URL(databaseUrl);
    const connectionConfig = {
      host: url.hostname,
      port: parseInt(url.port) || 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.substring(1),
      connectTimeout: 10000,
      acquireTimeout: 10000,
      timeout: 10000,
      reconnect: false
    };

    // Crear conexión
    const connection = await mysql.createConnection(connectionConfig);

    try {
      // Obtener productos de la misma categoría, excluyendo el producto actual
      const relatedProductsQuery = `
        SELECT 
          p.id,
          p.sku,
          p.nombre,
          p.url_imagen,
          c.nombre as categoria_nombre
        FROM productos p
        LEFT JOIN categorias c ON p.categoria_id = c.id
        WHERE p.categoria_id = ?
        ${excludeId ? 'AND p.id != ?' : ''}
        ORDER BY p.id DESC
        LIMIT ?
      `;

      const queryParams = excludeId 
        ? [categoryId, excludeId, limit]
        : [categoryId, limit];

      const [relatedProducts] = await connection.query(relatedProductsQuery, queryParams);

      console.log('Productos relacionados encontrados:', relatedProducts.length);

      // Para cada producto, obtener su stock y colores
      const formattedProducts = [];

      for (const product of relatedProducts) {
        try {
          const stockQuery = `
            SELECT 
              s.cantidad,
              s.precio,
              co.id as color_id,
              co.nombre as color_nombre,
              co.codigo_hex
            FROM stock_detalle s
            LEFT JOIN colores co ON s.color_id = co.id
            WHERE s.producto_id = ?
          `;

          const [stockResult] = await connection.query(stockQuery, [product.id]);

          formattedProducts.push({
            id: product.id,
            sku: product.sku,
            name: product.nombre,
            category: product.categoria_nombre,
            mainImage: product.url_imagen,
            thumbnailImage: product.url_imagen,
            minPrice: stockResult.length > 0 ? Math.min(...stockResult.map(s => s.precio)) : 0,
            maxPrice: stockResult.length > 0 ? Math.max(...stockResult.map(s => s.precio)) : 0,
            hasStock: stockResult.some(item => item.cantidad > 0),
            colors: stockResult.map(stockItem => ({
              id: stockItem.color_id,
              name: stockItem.color_nombre,
              hex: stockItem.codigo_hex,
              available: stockItem.cantidad > 0
            }))
          });
        } catch (stockError) {
          console.error(`Error procesando stock para producto ${product.id}:`, stockError);
          
          // Agregar producto sin stock si falla
          formattedProducts.push({
            id: product.id,
            sku: product.sku,
            name: product.nombre,
            category: product.categoria_nombre,
            mainImage: product.url_imagen,
            thumbnailImage: product.url_imagen,
            minPrice: 0,
            maxPrice: 0,
            hasStock: false,
            colors: []
          });
        }
      }

      console.log('Productos relacionados formateados:', formattedProducts.length);

      return NextResponse.json(formattedProducts);

    } finally {
      await connection.end();
    }

  } catch (error) {
    console.error('❌ Error obteniendo productos relacionados:', error);
    console.error('Stack trace:', error.stack);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}
