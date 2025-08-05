export async function getSales(start, end) {
  const params = new URLSearchParams();
  if (start) params.append('start', start);
  if (end) params.append('end', end);

  const res = await fetch(`/api/sales?${params.toString()}`);
  if (!res.ok) throw new Error('Error obteniendo ventas');
  return res.json();
}

export async function getKpis() {
  const res = await fetch('/api/sales/kpis');
  if (!res.ok) throw new Error('Error obteniendo KPIs');
  return res.json();
}
