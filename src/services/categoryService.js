export async function getCategories() {
  const maxRetries = 3;
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Error obteniendo categorías');
      const data = await res.json();
      
      // Extraer el array de categorías de la respuesta
      if (data.success && data.categories) {
        return data.categories;
      } else if (Array.isArray(data)) {
        return data;
      } else {
        console.error('Formato inesperado de categorías:', data);
        return [];
      }
    } catch (error) {
      lastError = error;
      console.error(`Error fetching categories (attempt ${attempt}/${maxRetries}):`, error);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Esperar antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  
  throw lastError;
}
