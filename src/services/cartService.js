// Servicio para operaciones del carrito

// Función simple para hacer fetch con token de localStorage
async function fetchWithCredentials(url, options = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return await fetch(url, {
    ...options,
    headers,
    credentials: 'include' // Mantener cookies también por compatibilidad
  });
}

// Agregar producto al carrito
export async function addToCart(productData) {
  const response = await fetchWithCredentials('/api/cart/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(productData)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
    
    if (response.status === 401) {
      throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
    } else if (response.status === 403) {
      throw new Error('No tienes permisos para realizar esta acción.');
    } else if (response.status === 404) {
      throw new Error('Producto no encontrado.');
    } else if (response.status === 400) {
      throw new Error(errorData.error || 'Datos inválidos.');
    } else {
      throw new Error(errorData.error || 'Error al agregar al carrito');
    }
  }

  return response.json();
}

// Obtener carrito del usuario
export async function getCart(userId) {
  const response = await fetchWithCredentials(`/api/cart/${userId}`, {
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Error al obtener el carrito');
  }

  return response.json();
}

// Actualizar cantidad de un item
export async function updateCartItem(itemId, quantity) {
  const response = await fetchWithCredentials(`/api/cart/items/${itemId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ cantidad: quantity })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Error al actualizar el item');
  }

  return response.json();
}

// Eliminar item del carrito
export async function removeCartItem(itemId) {
  const response = await fetchWithCredentials(`/api/cart/items/${itemId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Error al eliminar el item');
  }

  return response.json();
}

// Limpiar carrito
export async function clearCart(userId) {
  const response = await fetchWithCredentials(`/api/cart/${userId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Error al limpiar el carrito');
  }

  return response.json();
}
