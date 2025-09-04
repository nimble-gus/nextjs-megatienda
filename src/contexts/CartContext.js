'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useClientAuth } from './ClientAuthContext';

// Contexto del carrito de compras
const CartContext = createContext();

// Hook para usar el contexto del carrito
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de CartProvider');
  }
  return context;
};

// Provider del contexto del carrito
export const CartProvider = ({ children }) => {
  const { isAuthenticated, user } = useClientAuth();
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cartTotal, setCartTotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);

  // Calcular totales cuando cambien los items del carrito
  useEffect(() => {
    const total = cartItems.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const count = cartItems.reduce((sum, item) => sum + item.cantidad, 0);
    
    setCartTotal(total);
    setItemCount(count);
  }, [cartItems]);

  // Cargar carrito del usuario autenticado
  const loadUserCart = useCallback(async () => {
    if (!isAuthenticated || !user) {
      console.log('🛒 [CartContext] No se puede cargar carrito - no autenticado o sin usuario');
      return;
    }

    try {
      console.log('🛒 [CartContext] Cargando carrito para usuario:', user.nombre);
      setIsLoading(true);
      
      const response = await fetch('/api/cart', {
        credentials: 'include'
      });

      console.log('🛒 [CartContext] Respuesta del servidor:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log('🛒 [CartContext] Carrito cargado exitosamente:', data.items?.length || 0, 'items');
        setCartItems(data.items || []);
      } else if (response.status === 401) {
        console.warn('⚠️ [CartContext] Usuario no autorizado (401) - limpiando carrito');
        setCartItems([]);
        // Opcional: disparar evento para que el sistema de auth sepa que hay un problema
        window.dispatchEvent(new CustomEvent('cartAuthError', { detail: { status: 401 } }));
      } else {
        console.error('❌ [CartContext] Error cargando carrito:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ [CartContext] Error cargando carrito:', error);
      // En caso de error, mantener el carrito actual
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  // Cargar carrito al autenticarse
  useEffect(() => {
    if (isAuthenticated) {
      loadUserCart();
    } else {
      // Si no está autenticado, cargar carrito del localStorage
      const savedCart = localStorage.getItem('guestCart');
      if (savedCart) {
        try {
          setCartItems(JSON.parse(savedCart));
        } catch (error) {
          console.error('Error cargando carrito del localStorage:', error);
          setCartItems([]);
        }
      }
    }
  }, [isAuthenticated, loadUserCart]);

  // Guardar carrito en localStorage cuando no esté autenticado
  useEffect(() => {
    if (!isAuthenticated && cartItems.length > 0) {
      localStorage.setItem('guestCart', JSON.stringify(cartItems));
    }
  }, [cartItems, isAuthenticated]);

  // Agregar item al carrito
  const addToCart = useCallback(async (producto, color, cantidad = 1) => {
    try {
      const newItem = {
        id: Date.now(), // ID temporal para items del localStorage
        producto_id: producto.id,
        color_id: color.id,
        cantidad: cantidad,
        precio: color.precio,
        producto: {
          id: producto.id,
          nombre: producto.nombre,
          sku: producto.sku,
          url_imagen: producto.url_imagen
        },
        color: {
          id: color.id,
          nombre: color.nombre,
          codigo_hex: color.codigo_hex
        }
      };

      if (isAuthenticated) {
        // Si está autenticado, guardar en la base de datos
        const response = await fetch('/api/cart/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            producto_id: producto.id,
            color_id: color.id,
            cantidad: cantidad
          })
        });

        if (response.ok) {
          const data = await response.json();
          setCartItems(prev => {
            // Buscar si ya existe un item con el mismo ID
            const existingIndex = prev.findIndex(item => item.id === data.item.id);
            if (existingIndex !== -1) {
              // Reemplazar el item existente
              const newItems = [...prev];
              newItems[existingIndex] = data.item;
              return newItems;
            } else {
              // Agregar nuevo item
              return [...prev, data.item];
            }
          });
        } else {
          const errorData = await response.json();
          if (response.status === 409) {
            // Error de stock insuficiente
            throw new Error(`Stock insuficiente. Disponible: ${errorData.available}, Solicitado: ${errorData.requested}`);
          } else {
            throw new Error(errorData.error || 'Error agregando al carrito');
          }
        }
      } else {
        // Si no está autenticado, agregar al localStorage
        setCartItems(prev => {
          // Buscar si ya existe un item con el mismo producto y color
          const existingIndex = prev.findIndex(item => 
            item.producto_id === newItem.producto_id && item.color_id === newItem.color_id
          );
          if (existingIndex !== -1) {
            // Actualizar cantidad del item existente
            const newItems = [...prev];
            newItems[existingIndex] = {
              ...newItems[existingIndex],
              cantidad: newItems[existingIndex].cantidad + newItem.cantidad
            };
            return newItems;
          } else {
            // Agregar nuevo item
            return [...prev, newItem];
          }
        });
      }
    } catch (error) {
      console.error('Error agregando al carrito:', error);
      throw error;
    }
  }, [isAuthenticated]);

  // Actualizar cantidad de un item
  const updateQuantity = useCallback(async (itemId, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      removeFromCart(itemId);
      return;
    }

    try {
      if (isAuthenticated) {
        // Si está autenticado, actualizar en la base de datos
        const response = await fetch(`/api/cart/update/${itemId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ cantidad: nuevaCantidad })
        });

        if (response.ok) {
          setCartItems(prev => 
            prev.map(item => 
              item.id === itemId 
                ? { ...item, cantidad: nuevaCantidad }
                : item
            )
          );
        } else {
          const errorData = await response.json();
          if (response.status === 409) {
            // Error de stock insuficiente
            throw new Error(`Stock insuficiente. Disponible: ${errorData.available}, Solicitado: ${errorData.requested}`);
          } else {
            throw new Error(errorData.error || 'Error actualizando cantidad');
          }
        }
      } else {
        // Si no está autenticado, actualizar en localStorage
        setCartItems(prev => 
          prev.map(item => 
            item.id === itemId 
              ? { ...item, cantidad: nuevaCantidad }
              : item
          )
        );
      }
    } catch (error) {
      console.error('Error actualizando cantidad:', error);
      throw error; // Re-lanzar el error para que llegue al componente
    }
  }, [isAuthenticated]);

  // Remover item del carrito
  const removeFromCart = useCallback(async (itemId) => {
    try {
      if (isAuthenticated) {
        // Si está autenticado, remover de la base de datos
        const response = await fetch(`/api/cart/remove/${itemId}`, {
          method: 'DELETE',
          credentials: 'include'
        });

        if (response.ok) {
          setCartItems(prev => prev.filter(item => item.id !== itemId));
        }
      } else {
        // Si no está autenticado, remover del localStorage
        setCartItems(prev => prev.filter(item => item.id !== itemId));
      }
    } catch (error) {
      console.error('Error removiendo del carrito:', error);
      throw error; // Re-lanzar el error para que llegue al componente
    }
  }, [isAuthenticated]);

  // Limpiar carrito
  const clearCart = useCallback(async () => {
    try {
      if (isAuthenticated) {
        // Si está autenticado, limpiar en la base de datos
        const response = await fetch('/api/cart/clear', {
          method: 'DELETE',
          credentials: 'include'
        });

        if (response.ok) {
          setCartItems([]);
        }
      } else {
        // Si no está autenticado, limpiar localStorage
        setCartItems([]);
        localStorage.removeItem('guestCart');
      }
    } catch (error) {
      console.error('Error limpiando carrito:', error);
    }
  }, [isAuthenticated]);

  // Migrar carrito del localStorage a la base de datos al autenticarse
  const migrateGuestCart = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    const guestCart = localStorage.getItem('guestCart');
    if (guestCart) {
      try {
        const items = JSON.parse(guestCart);
        
        // Migrar cada item
        for (const item of items) {
          await addToCart(
            { id: item.producto_id, nombre: item.producto.nombre, sku: item.producto.sku, url_imagen: item.producto.url_imagen },
            { id: item.color_id, nombre: item.color.nombre, codigo_hex: item.color.codigo_hex, precio: item.precio },
            item.cantidad
          );
        }

        // Limpiar localStorage
        localStorage.removeItem('guestCart');
      } catch (error) {
        console.error('Error migrando carrito:', error);
      }
    }
  }, [isAuthenticated, user, addToCart]);

  // Migrar carrito cuando se autentique
  useEffect(() => {
    if (isAuthenticated) {
      migrateGuestCart();
    }
  }, [isAuthenticated, migrateGuestCart]);

  const value = {
    // Estado
    cartItems,
    isLoading,
    cartTotal,
    itemCount,
    
    // Métodos
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    loadUserCart,
    
    // Utilidades
    hasItems: cartItems.length > 0,
    isEmpty: cartItems.length === 0
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
