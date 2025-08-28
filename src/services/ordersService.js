// Servicio para manejar órdenes
export const getPendingOrdersCount = async (retryCount = 0) => {
  try {
    // Verificar si hay cookies de admin disponibles
    const hasAdminCookies = document.cookie.includes('adminAccessToken') || document.cookie.includes('adminRefreshToken');
    
    if (!hasAdminCookies && retryCount === 0) {
      
      
      // Intentar hacer refresh de la autenticación
      try {
        const refreshResponse = await fetch('/api/auth/admin/refresh', {
          method: 'POST',
          credentials: 'include'
        });
        
        if (refreshResponse.ok) {

          // Esperar un momento para que las cookies se establezcan
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (refreshError) {
        
      }
    }

    const response = await fetch('/api/admin/orders/pending-count', {
      method: 'GET',
      credentials: 'include'
    });

    if (response.ok) {
      const data = await response.json();
      return data.pendingCount || 0;
    } else {
      // Si es error 401 o 403, intentar una vez más después de un delay
      if ((response.status === 401 || response.status === 403) && retryCount < 1) {

        await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar 2 segundos
        return getPendingOrdersCount(retryCount + 1);
      }
      
      // Si es error 401 o 403 después del retry, no mostrar error en consola
      if (response.status === 401 || response.status === 403) {

        return 0;
      }
      console.error('Error obteniendo conteo de órdenes pendientes:', response.status);
      return 0;
    }
  } catch (error) {
    console.error('Error en getPendingOrdersCount:', error);
    return 0;
  }
};

export const getOrders = async () => {
  try {
    const response = await fetch('/api/admin/orders', {
      method: 'GET',
      credentials: 'include'
    });

    if (response.ok) {
      const data = await response.json();
      return data.orders || [];
    } else {
      console.error('Error obteniendo órdenes:', response.status);
      return [];
    }
  } catch (error) {
    console.error('Error en getOrders:', error);
    return [];
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ estado: status })
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.error('Error actualizando estado de orden:', response.status);
      throw new Error('Error al actualizar el estado de la orden');
    }
  } catch (error) {
    console.error('Error en updateOrderStatus:', error);
    throw error;
  }
};
