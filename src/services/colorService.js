export async function getColors() {
  const res = await fetch('/api/colors');
  if (!res.ok) throw new Error('Error obteniendo colores');
  return res.json();
}