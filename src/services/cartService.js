// Servicio para operaciones del carrito

// Agregar producto al carrito
export async function addToCart(productData) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No hay token de autenticación');
  }
  
  const response = await fetch('/api/cart/add', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
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
  const token = localStorage.getItem('token');
  
  const response = await fetch(`/api/cart/${userId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
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
  const token = localStorage.getItem('token');
  
  const response = await fetch(`/api/cart/items/${itemId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
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
  const token = localStorage.getItem('token');
  
  const response = await fetch(`/api/cart/items/${itemId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
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
  const token = localStorage.getItem('token');
  
  const response = await fetch(`/api/cart/${userId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Error al limpiar el carrito');
  }

  return response.json();
}
