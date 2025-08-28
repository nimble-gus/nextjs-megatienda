'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Topbar from '@/components/layout/Topbar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartItems from '@/components/Cart/CartItems';
import CartSummary from '@/components/Cart/CartSummary';
import '@/styles/CartPage.css';

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Verificar si hay usuario logueado
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        loadCartItems(userData.id || userData.usuario_id);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        setError('Error al cargar datos del usuario');
        setLoading(false);
      }
    } else {
      setError('Debes iniciar sesión para ver tu carrito');
      setLoading(false);
    }
  }, []);

  const loadCartItems = async (userId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Agregar timestamp para evitar caché del navegador
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/cart/${userId}?_t=${timestamp}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar el carrito');
      }

      const data = await response.json();
      // Ordenar items por ID para mantener consistencia
      const sortedItems = (data.items || []).sort((a, b) => a.id - b.id);
      setCartItems(sortedItems);
      
      // Disparar evento para actualizar contador en el header
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
      console.error('Error cargando carrito:', error);
      setError('Error al cargar los items del carrito');
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    try {
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

      // Actualizar solo el item específico en el estado local
      const updatedData = await response.json();
      setCartItems(prevItems => 
        prevItems.map(item => 
          item.id === itemId 
            ? { ...item, cantidad: updatedData.item.cantidad, precio: updatedData.item.precio }
            : item
        )
      );
      
      // Disparar evento para actualizar contador en el header
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
      console.error('Error actualizando item:', error);
      alert(error.message);
    }
  };

  const removeCartItem = async (itemId) => {
    try {
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

      // Actualizar estado local removiendo el item
      setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
      
      // Disparar evento para actualizar contador en el header
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
      console.error('Error eliminando item:', error);
      alert('Error al eliminar el producto');
    }
  };

  const clearCart = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/cart/${user.id || user.usuario_id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al limpiar el carrito');
      }

      setCartItems([]);
      
      // Disparar evento para actualizar contador en el header
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
      console.error('Error limpiando carrito:', error);
      alert('Error al limpiar el carrito');
    }
  };

  const handleCheckout = () => {
    // Redirigir a la página de checkout
    router.push('/checkout');
  };

  if (loading) {
    return (
      <div className="cart-page">
        <div className="sticky-wrapper">
          <Topbar />
          <Header />
        </div>
        <main className="cart-main">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando tu carrito...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="cart-page">
        <div className="sticky-wrapper">
          <Topbar />
          <Header />
        </div>
        <main className="cart-main">
          <div className="error-container">
            <h2>Error</h2>
            <p>{error}</p>
            <button onClick={() => window.history.back()}>Volver</button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="sticky-wrapper">
        <Topbar />
        <Header />
      </div>

      <main className="cart-main">
        {/* Header de la página */}
        <div className="page-header">
          <div className="page-header-content">
            <h1>Carrito de compras</h1>
            <div className="breadcrumb">
              <span>Inicio</span>
              <span>›</span>
              <span>Carrito de compras</span>
            </div>
          </div>
        </div>

        {/* Contenido principal del carrito */}
        <div className="cart-container">
          <div className="cart-content">
            {/* Columna izquierda - Items del carrito */}
            <div className="cart-items-section">
              <CartItems 
                items={cartItems}
                onUpdateQuantity={updateCartItem}
                onRemoveItem={removeCartItem}
                onClearCart={clearCart}
              />
            </div>

            {/* Columna derecha - Resumen del carrito */}
            <div className="cart-summary-section">
              <CartSummary 
                items={cartItems}
                onCheckout={handleCheckout}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
