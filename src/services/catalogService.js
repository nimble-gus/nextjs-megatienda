// CatalogService.js - Servicio para el catálogo de productos

export const getProducts = async (filters = {}) => {
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
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
      if (filters.categories && filters.categories.length > 0) {
        filters.categories.forEach(category => params.append('categories', category));
      }
      
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
        throw new Error(`Error al obtener productos del catálogo: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      lastError = error;
      console.error(`Error fetching catalog products (attempt ${attempt}/${maxRetries}):`, error);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Esperar antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  
  throw lastError;
};

export const getCatalogFilters = async () => {
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch('/api/catalog/filters');
      if (!response.ok) {
        throw new Error(`Error al obtener filtros del catálogo: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      lastError = error;
      console.error(`Error fetching catalog filters (attempt ${attempt}/${maxRetries}):`, error);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Esperar antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  
  throw lastError;
};
