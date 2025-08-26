export async function getSales(start, end) {
  try {
    const params = new URLSearchParams();
    if (start) params.append('start', start);
    if (end) params.append('end', end);
    const res = await fetch(`/api/sales?${params.toString()}`);
    
    if (!res.ok) {
      console.error('Error en respuesta de ventas:', res.status, res.statusText);
      throw new Error('Error obteniendo ventas');
    }
    
    const data = await res.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    return data;
  } catch (error) {
    console.error('Error en getSales:', error);
    return { 
      sales: [], 
      summary: { 
        totalVentas: 0, 
        totalPedidos: 0, 
        fechaInicio: start, 
        fechaFin: end 
      } 
    };
  }
}

export async function getKpis() {
  try {
    // Obtener KPIs de ventas
    const salesRes = await fetch('/api/sales/kpis');
    
    if (!salesRes.ok) {
      console.error('Error en respuesta de KPIs:', salesRes.status);
      throw new Error('Error obteniendo KPIs de ventas');
    }
    
    const salesData = await salesRes.json();
    
    if (salesData.error) {
      console.error('Error en datos de KPIs:', salesData.error);
      throw new Error(salesData.error);
    }
    // Obtener KPIs de estados de pedidos
    let orderStatusKpis = {
      pedidosPendientes: 0,
      contraEntregaPendientes: 0,
      transferenciaPendientes: 0
    };
    
    try {
      const orderStatusRes = await fetch('/api/sales/order-status-kpis');
      if (orderStatusRes.ok) {
        const orderStatusData = await orderStatusRes.json();
        if (orderStatusData.success) {
          orderStatusKpis = orderStatusData.data;
        }
      }
    } catch (orderStatusError) {
      console.warn('⚠️ Error obteniendo KPIs de estados de pedidos (no crítico):', orderStatusError);
    }
    
    // Obtener contador de mensajes nuevos (opcional)
    let unreadMessages = 0;
    try {
      const messagesRes = await fetch('/api/admin/contact-messages');
      if (messagesRes.ok) {
        const messagesData = await messagesRes.json();
        unreadMessages = messagesData.success 
          ? messagesData.data.filter(msg => !msg.leido).length 
          : 0;
      }
    } catch (messagesError) {
      console.warn('⚠️ Error obteniendo mensajes (no crítico):', messagesError);
    }
    
    const result = {
      ...salesData,
      ...orderStatusKpis,
      mensajesNuevos: unreadMessages
    };
    return result;
    
  } catch (error) {
    console.error('❌ Error obteniendo KPIs:', error);
    return {
      totalVentas: 0,
      totalPedidos: 0,
      totalClientes: 0,
      pedidosPendientes: 0,
      contraEntregaPendientes: 0,
      transferenciaPendientes: 0,
      mensajesNuevos: 0,
      error: error.message
    };
  }
}
