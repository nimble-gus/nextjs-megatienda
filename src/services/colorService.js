export async function getColors() {
  const res = await fetch('/api/colors');
  if (!res.ok) throw new Error('Error obteniendo colores');
  const data = await res.json();
  
  // Manejar diferentes formatos de respuesta
  if (Array.isArray(data)) {
    return data;
  } else if (data.success && data.colors) {
    return data.colors;
  } else {
    console.error('Formato inesperado de colores:', data);
    return [];
  }
}