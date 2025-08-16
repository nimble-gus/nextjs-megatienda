export async function getCategories() {
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
}
