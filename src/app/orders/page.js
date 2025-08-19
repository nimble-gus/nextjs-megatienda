'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import '@/styles/OrdersPage.css';

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Verificar si el usuario está logueado
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      router.push('/');
      return;
    }

    try {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      loadUserOrders(userData.id || userData.usuario_id);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/');
    }
  }, [router]);

  const loadUserOrders = async (userId) => {
    try {
      setIsLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/orders/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      } else {
        setError('Error cargando los pedidos');
      }
    } catch (error) {
      console.error('Error cargando pedidos:', error);
      setError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendiente':
        return 'status-pending';
      case 'procesando':
        return 'status-processing';
      case 'enviado':
        return 'status-shipped';
      case 'entregado':
        return 'status-delivered';
      case 'cancelado':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pendiente':
        return 'Pendiente';
      case 'procesando':
        return 'Procesando';
      case 'enviado':
        return 'Enviado';
      case 'entregado':
        return 'Entregado';
      case 'cancelado':
        return 'Cancelado';
      default:
        return 'Pendiente';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return `Q${parseFloat(price).toFixed(2)}`;
  };

  // Mostrar loading
  if (isLoading) {
    return (
      <div className="orders-page">
        <div className="sticky-wrapper">
          <Header />
        </div>
        <div className="orders-main">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <div className="loading-text">Cargando tus pedidos...</div>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar error
  if (error) {
    return (
      <div className="orders-page">
        <div className="sticky-wrapper">
          <Header />
        </div>
        <div className="orders-main">
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <div className="error-title">Error</div>
            <div className="error-message">{error}</div>
            <button onClick={() => window.location.reload()} className="retry-btn">
              Intentar de nuevo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="sticky-wrapper">
        <Header />
      </div>
      
      <div className="orders-main">
        {/* Header de la página */}
        <div className="page-header">
          <div className="page-header-content">
            <h1>Mis Pedidos</h1>
            <div className="breadcrumb">
              <span>Inicio</span>
              <span>•</span>
              <span>Mi Cuenta</span>
              <span>•</span>
              <span>Mis Pedidos</span>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="orders-container">
          {orders.length === 0 ? (
            <div className="empty-orders">
              <div className="empty-icon">📦</div>
              <div className="empty-title">No tienes pedidos aún</div>
              <div className="empty-message">
                Cuando hagas tu primer pedido, aparecerá aquí con todos los detalles.
              </div>
              <Link href="/catalog" className="start-shopping-btn">
                Comenzar a comprar
              </Link>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order) => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div className="order-info">
                      <div className="order-number">
                        Pedido #{order.codigo_orden}
                      </div>
                      <div className="order-date">
                        {formatDate(order.fecha_creacion)}
                      </div>
                    </div>
                    <div className={`order-status ${getStatusColor(order.estado)}`}>
                      {getStatusText(order.estado)}
                    </div>
                  </div>

                  <div className="order-items">
                    {order.detalles?.map((item, index) => (
                      <div key={index} className="order-item">
                        <img
                          src={item.producto?.imagenes?.[0]?.url || '/assets/placeholder.jpg'}
                          alt={item.producto?.nombre || 'Producto'}
                          className="item-image"
                        />
                        <div className="item-details">
                          <div className="item-name">
                            {item.producto?.nombre || 'Producto no disponible'}
                          </div>
                          <div className="item-meta">
                            Cantidad: {item.cantidad} | 
                            Color: {item.color?.nombre || 'N/A'}
                          </div>
                        </div>
                        <div className="item-price">
                          {formatPrice(item.precio_unitario * item.cantidad)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="order-summary">
                    <div className="order-totals">
                      <div className="total-row">
                        <span>Subtotal:</span>
                        <span>{formatPrice(order.subtotal)}</span>
                      </div>
                      <div className="total-row">
                        <span>Envío:</span>
                        <span>{formatPrice(order.costo_envio)}</span>
                      </div>
                      <div className="total-row final">
                        <span>Total:</span>
                        <span>{formatPrice(order.total)}</span>
                      </div>
                    </div>

                    <div className="order-actions">
                      <Link 
                        href={`/orders/${order.codigo_orden}`}
                        className="view-details-btn"
                      >
                        Ver Detalles
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
