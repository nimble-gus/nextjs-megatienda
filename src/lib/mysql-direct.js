import mysql from 'mysql2/promise';

// Configuración de conexión
const getConnectionConfig = () => {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL no está configurada');
  }

  const url = new URL(databaseUrl);
  return {
    host: url.hostname,
    port: parseInt(url.port) || 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.substring(1),
    // Configuración válida para createConnection
    connectTimeout: 60000,
    // Configuraciones adicionales para estabilidad
    supportBigNumbers: true,
    bigNumberStrings: true,
    dateStrings: false,
    debug: false,
    trace: false,
    multipleStatements: false
  };
};

// Función para ejecutar consultas
export const executeQuery = async (query, params = []) => {
  const connection = await mysql.createConnection(getConnectionConfig());
  
  try {
    const [rows] = await connection.execute(query, params);
    return rows;
  } finally {
    await connection.end();
  }
};

// Función para obtener productos destacados
export const getFeaturedProducts = async () => {
  const query = `
    SELECT 
      p.id,
      p.sku,
      p.nombre,
      p.descripcion,
      p.url_imagen,
      p.featured,
      c.nombre as categoria_nombre,
      COALESCE(MIN(s.precio), 0) as precio_min,
      COALESCE(MAX(s.precio), 0) as precio_max,
      COALESCE(SUM(s.cantidad), 0) as stock_total
    FROM productos p
    LEFT JOIN categorias c ON p.categoria_id = c.id
    LEFT JOIN stock_detalle s ON p.id = s.producto_id
    WHERE p.featured = 1
    GROUP BY p.id, p.sku, p.nombre, p.descripcion, p.url_imagen, p.featured, c.nombre
    ORDER BY RAND()
    LIMIT 4
  `;
  
  return await executeQuery(query);
};

// Función para obtener categorías
export const getCategories = async () => {
  const query = `
    SELECT 
      c.id, 
      c.nombre,
      COUNT(p.id) as productos_count
    FROM categorias c
    LEFT JOIN productos p ON c.id = p.categoria_id
    GROUP BY c.id, c.nombre
    ORDER BY c.nombre ASC
  `;
  
  return await executeQuery(query);
};

// Función para obtener imágenes de hero
export const getHeroImages = async () => {
  const query = `
    SELECT id, titulo, subtitulo, url_imagen, orden, activo
    FROM hero_images
    WHERE activo = 1
    ORDER BY orden ASC
  `;
  
  return await executeQuery(query);
};

// Función para obtener banners promocionales
export const getPromoBanners = async () => {
  const query = `
    SELECT id, titulo, descripcion, url_imagen, orden, activo
    FROM promo_banners
    WHERE activo = 1
    ORDER BY orden ASC
  `;
  
  return await executeQuery(query);
};

// Función para obtener productos del catálogo con filtros
export const getCatalogProducts = async (filters = {}) => {
  const {
    page = 1,
    limit = 12,
    sortBy = 'default',
    minPrice = 0,
    maxPrice = 999999,
    categories = [],
    colors = [],
    search = ''
  } = filters;

  const offset = (page - 1) * limit;
  
  // Consulta base con JOIN para stock
  let query = `
    SELECT 
      p.id,
      p.sku,
      p.nombre,
      p.descripcion,
      p.url_imagen,
      p.featured,
      p.categoria_id,
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

  // Filtro de precio - usar EXISTS para verificar que el producto tenga stock en el rango de precio
  if (minPrice > 0 || maxPrice < 999999) {
    whereConditions.push('EXISTS (SELECT 1 FROM stock_detalle sd WHERE sd.producto_id = p.id AND sd.precio >= ? AND sd.precio <= ?)');
    queryParams.push(minPrice.toString(), maxPrice.toString());
  }

  // Filtro de categorías
  if (categories && categories.length > 0) {
    const placeholders = categories.map(() => '?').join(',');
    whereConditions.push(`p.categoria_id IN (${placeholders})`);
    queryParams.push(...categories.map(cat => cat.toString()));
  }

  // Filtro de búsqueda
  if (search) {
    whereConditions.push('(p.nombre LIKE ? OR p.descripcion LIKE ? OR p.sku LIKE ?)');
    const searchTerm = `%${search}%`;
    queryParams.push(searchTerm, searchTerm, searchTerm);
  }

  // Agregar condiciones WHERE si existen
  if (whereConditions.length > 0) {
    query += ' WHERE ' + whereConditions.join(' AND ');
  }

  // Agregar GROUP BY
  query += ' GROUP BY p.id, p.sku, p.nombre, p.descripcion, p.url_imagen, p.featured, p.categoria_id, c.nombre';

  // Ordenamiento
  switch (sortBy) {
    case 'price_asc':
      query += ' ORDER BY precio_min ASC';
      break;
    case 'price_desc':
      query += ' ORDER BY precio_min DESC';
      break;
    case 'name_asc':
      query += ' ORDER BY p.nombre ASC';
      break;
    case 'name_desc':
      query += ' ORDER BY p.nombre DESC';
      break;
    case 'newest':
      query += ' ORDER BY p.id DESC';
      break;
    default:
      query += ' ORDER BY p.id DESC';
  }

  // Agregar paginación
  query += ' LIMIT ? OFFSET ?';
  queryParams.push(limit.toString(), offset.toString());

  return await executeQuery(query, queryParams);
};

// Función para contar productos del catálogo
export const getCatalogProductsCount = async (filters = {}) => {
  const {
    minPrice = 0,
    maxPrice = 999999,
    categories = [],
    search = ''
  } = filters;

  let query = `
    SELECT COUNT(DISTINCT p.id) as total
    FROM productos p
  `;

  const whereConditions = [];
  const queryParams = [];

  // Filtro de precio - usar EXISTS para verificar que el producto tenga stock en el rango de precio
  if (minPrice > 0 || maxPrice < 999999) {
    whereConditions.push('EXISTS (SELECT 1 FROM stock_detalle sd WHERE sd.producto_id = p.id AND sd.precio >= ? AND sd.precio <= ?)');
    queryParams.push(minPrice.toString(), maxPrice.toString());
  }

  // Filtro de categorías
  if (categories && categories.length > 0) {
    const placeholders = categories.map(() => '?').join(',');
    whereConditions.push(`p.categoria_id IN (${placeholders})`);
    queryParams.push(...categories.map(cat => cat.toString()));
  }

  // Filtro de búsqueda
  if (search) {
    whereConditions.push('(p.nombre LIKE ? OR p.descripcion LIKE ? OR p.sku LIKE ?)');
    const searchTerm = `%${search}%`;
    queryParams.push(searchTerm, searchTerm, searchTerm);
  }

  // Agregar condiciones WHERE si existen
  if (whereConditions.length > 0) {
    query += ' WHERE ' + whereConditions.join(' AND ');
  }

  const result = await executeQuery(query, queryParams);
  return result[0].total;
};
