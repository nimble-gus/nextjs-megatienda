export async function getSales(start, end) {
  const params = new URLSearchParams();
  if (start) params.append('start', start);
  if (end) params.append('end', end);

  const res = await fetch(`/api/sales?${params.toString()}`);
  if (!res.ok) throw new Error('Error obteniendo ventas');
  return res.json();
}

export async function getKpis() {
  try {
    // Obtener KPIs de ventas
    const salesRes = await fetch('/api/sales/kpis');
    const salesData = await salesRes.json();
    
    // Obtener contador de mensajes nuevos
    const messagesRes = await fetch('/api/admin/contact-messages');
    const messagesData = await messagesRes.json();
    
    const unreadMessages = messagesData.success 
      ? messagesData.data.filter(msg => !msg.leido).length 
      : 0;
    
    return {
      ...salesData,
      mensajesNuevos: unreadMessages
    };
  } catch (error) {
    console.error('Error obteniendo KPIs:', error);
    return {
      totalVentas: 0,
      totalPedidos: 0,
      totalClientes: 0,
      mensajesNuevos: 0
    };
  }
}
