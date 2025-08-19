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
    return []; // Retornar array vacío en caso de error
  }
}

export async function getKpis() {
  try {
    console.log('🔄 Obteniendo KPIs...');
    
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
    
    console.log('✅ KPIs de ventas obtenidos:', salesData);
    
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
      mensajesNuevos: unreadMessages
    };
    
    console.log('📊 KPIs finales:', result);
    return result;
    
  } catch (error) {
    console.error('❌ Error obteniendo KPIs:', error);
    return {
      totalVentas: 0,
      totalPedidos: 0,
      totalClientes: 0,
      mensajesNuevos: 0,
      error: error.message
    };
  }
}
