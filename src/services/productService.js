export async function getProducts(filters = {}) {
  const params = new URLSearchParams();
  
  // Agregar filtros a los parámetros
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);
  if (filters.category) params.append('category', filters.category);
  if (filters.minPrice) params.append('minPrice', filters.minPrice);
  if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
  if (filters.colors) params.append('colors', filters.colors.join(','));
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.search) params.append('search', filters.search);

  const res = await fetch(`/api/products?${params.toString()}`);
  if (!res.ok) throw new Error('Error al obtener productos');
  return res.json();
}

export async function createFullProduct(productData) {
  const res = await fetch('/api/products/full', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData),
  });
  if (!res.ok) throw new Error('Error creando producto');
  return res.json();
}

// Obtener detalles completos de un producto por ID
export async function getProductById(productId) {
  const res = await fetch(`/api/products/${productId}`);
  if (!res.ok) throw new Error('Error al obtener detalles del producto');
  return res.json();
}

// Obtener productos relacionados por categoría
export async function getRelatedProducts(categoryId, currentProductId, limit = 4) {
  const res = await fetch(`/api/products/related?categoryId=${categoryId}&excludeId=${currentProductId}&limit=${limit}`);
  if (!res.ok) throw new Error('Error al obtener productos relacionados');
  return res.json();
}

// Obtener stock disponible por producto y color
export async function getProductStock(productId) {
  const res = await fetch(`/api/products/${productId}/stock`);
  if (!res.ok) throw new Error('Error al obtener stock del producto');
  return res.json();
}

// Obtener filtros disponibles para el catálogo
export async function getCatalogFilters() {
  const res = await fetch('/api/catalog/filters');
  if (!res.ok) throw new Error('Error al obtener filtros del catálogo');
  return res.json();
}