// CatalogService.js - Servicio para el catálogo de productos

export const getProducts = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    // Agregar parámetros de paginación
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    
    // Agregar filtros de precio
    if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice);
    
    // Agregar filtros de categoría
    if (filters.category) params.append('category', filters.category);
    
    // Agregar filtros de color
    if (filters.colors && filters.colors.length > 0) {
      filters.colors.forEach(color => params.append('colors', color));
    }
    
    // Agregar término de búsqueda
    if (filters.search) params.append('search', filters.search);
    
    // Agregar timestamp para evitar caché
    params.append('_t', Date.now());
    
    const response = await fetch(`/api/catalog/products?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error('Error al obtener productos del catálogo');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching catalog products:', error);
    throw error;
  }
};

export const getCatalogFilters = async () => {
  try {
    const response = await fetch('/api/catalog/filters');
    if (!response.ok) {
      throw new Error('Error al obtener filtros del catálogo');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching catalog filters:', error);
    throw error;
  }
};
