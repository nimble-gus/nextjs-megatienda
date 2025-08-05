export async function getCategories() {
  const res = await fetch('/api/categories');
  if (!res.ok) throw new Error('Error obteniendo categorías');
  return res.json();
}
