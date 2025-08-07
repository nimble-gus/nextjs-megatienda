export async function getProducts() {
  const res = await fetch('/api/products');
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