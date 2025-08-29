import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql-direct';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 12;
    const sortBy = searchParams.get('sortBy') || 'default';
    const minPrice = parseFloat(searchParams.get('minPrice')) || 0;
    const maxPrice = parseFloat(searchParams.get('maxPrice')) || 999999;
    const category = searchParams.get('category');
    const search = searchParams.get('search') || '';

    const offset = (page - 1) * limit;
    
    const results = {};

    // Prueba 1: Consulta básica sin filtros
    console.log('=== PRUEBA 1: Consulta básica sin filtros ===');
    try {
      const basicQuery = `
        SELECT 
          p.id,
          p.nombre,
          p.sku,
          c.nombre as categoria_nombre,
          COALESCE(MIN(s.precio), 0) as precio_min,
          COALESCE(MAX(s.precio), 0) as precio_max,
          COALESCE(SUM(s.cantidad), 0) as stock_total
        FROM productos p
        LEFT JOIN categorias c ON p.categoria_id = c.id
        LEFT JOIN stock_detalle s ON p.id = s.producto_id
        GROUP BY p.id, p.nombre, p.sku, c.nombre
        ORDER BY p.id DESC
        LIMIT 5
      `;
      results.basic = await executeQuery(basicQuery);
      console.log('✅ Consulta básica exitosa');
    } catch (error) {
      results.basic = { error: error.message };
      console.log('❌ Consulta básica falló:', error.message);
    }

    // Prueba 2: Filtro de precio con EXISTS
    console.log('=== PRUEBA 2: Filtro de precio con EXISTS ===');
    try {
      const priceQuery = `
        SELECT 
          p.id,
          p.nombre,
          p.sku,
          c.nombre as categoria_nombre,
          COALESCE(MIN(s.precio), 0) as precio_min,
          COALESCE(MAX(s.precio), 0) as precio_max,
          COALESCE(SUM(s.cantidad), 0) as stock_total
        FROM productos p
        LEFT JOIN categorias c ON p.categoria_id = c.id
        LEFT JOIN stock_detalle s ON p.id = s.producto_id
        WHERE EXISTS (SELECT 1 FROM stock_detalle sd WHERE sd.producto_id = p.id AND sd.precio >= ? AND sd.precio <= ?)
        GROUP BY p.id, p.nombre, p.sku, c.nombre
        ORDER BY p.id DESC
        LIMIT 5
      `;
      results.priceFilter = await executeQuery(priceQuery, [minPrice.toString(), maxPrice.toString()]);
      console.log('✅ Filtro de precio exitoso');
    } catch (error) {
      results.priceFilter = { error: error.message };
      console.log('❌ Filtro de precio falló:', error.message);
    }

    // Prueba 3: Filtro de categoría
    console.log('=== PRUEBA 3: Filtro de categoría ===');
    if (category) {
      try {
        const categoryQuery = `
          SELECT 
            p.id,
            p.nombre,
            p.sku,
            c.nombre as categoria_nombre,
            COALESCE(MIN(s.precio), 0) as precio_min,
            COALESCE(MAX(s.precio), 0) as precio_max,
            COALESCE(SUM(s.cantidad), 0) as stock_total
          FROM productos p
          LEFT JOIN categorias c ON p.categoria_id = c.id
          LEFT JOIN stock_detalle s ON p.id = s.producto_id
          WHERE p.categoria_id = ?
          GROUP BY p.id, p.nombre, p.sku, c.nombre
          ORDER BY p.id DESC
          LIMIT 5
        `;
        results.categoryFilter = await executeQuery(categoryQuery, [category.toString()]);
        console.log('✅ Filtro de categoría exitoso');
      } catch (error) {
        results.categoryFilter = { error: error.message };
        console.log('❌ Filtro de categoría falló:', error.message);
      }
    }

    // Prueba 4: Filtro de búsqueda
    console.log('=== PRUEBA 4: Filtro de búsqueda ===');
    if (search) {
      try {
        const searchQuery = `
          SELECT 
            p.id,
            p.nombre,
            p.sku,
            c.nombre as categoria_nombre,
            COALESCE(MIN(s.precio), 0) as precio_min,
            COALESCE(MAX(s.precio), 0) as precio_max,
            COALESCE(SUM(s.cantidad), 0) as stock_total
          FROM productos p
          LEFT JOIN categorias c ON p.categoria_id = c.id
          LEFT JOIN stock_detalle s ON p.id = s.producto_id
          WHERE (p.nombre LIKE ? OR p.descripcion LIKE ? OR p.sku LIKE ?)
          GROUP BY p.id, p.nombre, p.sku, c.nombre
          ORDER BY p.id DESC
          LIMIT 5
        `;
        const searchTerm = `%${search}%`;
        results.searchFilter = await executeQuery(searchQuery, [searchTerm, searchTerm, searchTerm]);
        console.log('✅ Filtro de búsqueda exitoso');
      } catch (error) {
        results.searchFilter = { error: error.message };
        console.log('❌ Filtro de búsqueda falló:', error.message);
      }
    }

    // Prueba 5: Consulta completa con todos los filtros
    console.log('=== PRUEBA 5: Consulta completa con filtros ===');
    try {
      let completeQuery = `
        SELECT 
          p.id,
          p.nombre,
          p.sku,
          c.nombre as categoria_nombre,
          COALESCE(MIN(s.precio), 0) as precio_min,
          COALESCE(MAX(s.precio), 0) as precio_max,
          COALESCE(SUM(s.cantidad), 0) as stock_total
        FROM productos p
        LEFT JOIN categorias c ON p.categoria_id = c.id
        LEFT JOIN stock_detalle s ON p.id = s.producto_id
      `;

      const whereConditions = [];
      const queryParams = [];

      // Filtro de precio
      if (minPrice > 0 || maxPrice < 999999) {
        whereConditions.push('EXISTS (SELECT 1 FROM stock_detalle sd WHERE sd.producto_id = p.id AND sd.precio >= ? AND sd.precio <= ?)');
        queryParams.push(minPrice.toString(), maxPrice.toString());
      }

      // Filtro de categoría
      if (category) {
        whereConditions.push('p.categoria_id = ?');
        queryParams.push(category.toString());
      }

      // Filtro de búsqueda
      if (search) {
        whereConditions.push('(p.nombre LIKE ? OR p.descripcion LIKE ? OR p.sku LIKE ?)');
        const searchTerm = `%${search}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm);
      }

      // Agregar condiciones WHERE si existen
      if (whereConditions.length > 0) {
        completeQuery += ' WHERE ' + whereConditions.join(' AND ');
      }

      completeQuery += ' GROUP BY p.id, p.nombre, p.sku, c.nombre ORDER BY p.id DESC LIMIT 5';

      results.complete = await executeQuery(completeQuery, queryParams);
      console.log('✅ Consulta completa exitosa');
    } catch (error) {
      results.complete = { error: error.message };
      console.log('❌ Consulta completa falló:', error.message);
    }

    // Prueba 6: Verificar datos de stock_detalle
    console.log('=== PRUEBA 6: Verificar datos de stock_detalle ===');
    try {
      const stockQuery = `
        SELECT 
          s.producto_id,
          p.nombre as producto_nombre,
          s.precio,
          s.cantidad,
          c.nombre as color_nombre
        FROM stock_detalle s
        LEFT JOIN productos p ON s.producto_id = p.id
        LEFT JOIN colores c ON s.color_id = c.id
        ORDER BY s.producto_id, s.precio
        LIMIT 10
      `;
      results.stockData = await executeQuery(stockQuery);
      console.log('✅ Datos de stock obtenidos');
    } catch (error) {
      results.stockData = { error: error.message };
      console.log('❌ Datos de stock fallaron:', error.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Diagnóstico de filtros completado',
      filters: {
        page,
        limit,
        sortBy,
        minPrice,
        maxPrice,
        category,
        search
      },
      results
    });

  } catch (error) {
    console.error('=== ERROR EN DIAGNÓSTICO DE FILTROS ===');
    console.error('Error completo:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error en diagnóstico de filtros',
      details: error.message
    }, { status: 500 });
  }
}
