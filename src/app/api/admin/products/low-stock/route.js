import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql-direct';

export async function GET() {
  try {
    // Obtener productos con stock total menor a 10 unidades usando SQL
    const lowStockQuery = `
      SELECT 
        p.id,
        p.sku,
        p.nombre,
        p.descripcion,
        p.url_imagen,
        c.nombre as categoria_nombre,
        COALESCE(SUM(s.cantidad), 0) as total_stock
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      LEFT JOIN stock_detalle s ON p.id = s.producto_id
      GROUP BY p.id, p.sku, p.nombre, p.descripcion, p.url_imagen, c.nombre
      HAVING COALESCE(SUM(s.cantidad), 0) < 10
      ORDER BY total_stock ASC, p.id DESC
    `;
    
    const lowStockProducts = await executeQuery(lowStockQuery);
    
    // Para cada producto con bajo stock, obtener los detalles del stock
    const formattedProducts = await Promise.all(
      lowStockProducts.map(async (product) => {
        const stockDetailsQuery = `
          SELECT 
            s.id,
            s.cantidad,
            s.precio,
            co.id as color_id,
            co.nombre as color_nombre,
            co.codigo_hex
          FROM stock_detalle s
          LEFT JOIN colores co ON s.color_id = co.id
          WHERE s.producto_id = ? AND s.cantidad > 0
          ORDER BY s.cantidad ASC
        `;
        
        const stockDetails = await executeQuery(stockDetailsQuery, [product.id]);
        
        return {
          id: product.id,
          sku: product.sku,
          nombre: product.nombre,
          descripcion: product.descripcion,
          url_imagen: product.url_imagen,
          categoria: product.categoria_nombre || 'Sin categoría',
          totalStock: product.total_stock,
          stockDetails: stockDetails.map(stock => ({
            id: stock.id,
            cantidad: stock.cantidad,
            precio: stock.precio,
            color: {
              id: stock.color_id,
              nombre: stock.color_nombre,
              codigo_hex: stock.codigo_hex
            }
          }))
        };
      })
    );

    return NextResponse.json({
      success: true,
      products: formattedProducts,
      total: formattedProducts.length
    });

  } catch (error) {
    console.error('=== ERROR EN API /api/admin/products/low-stock ===');
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
