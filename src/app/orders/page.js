'use client';

import React, { useState, useEffect } from 'react';
import { useClientAuth } from '@/contexts/ClientAuthContext';
import { Package, Calendar, DollarSign, MapPin, CreditCard, Eye, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';
import Link from 'next/link';
import Topbar from '@/components/layout/Topbar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import '@/styles/OrdersPage.css';

const OrdersPage = () => {
  const { user, isAuthenticated } = useClientAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchUserOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/user/${user.id}`);
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.orders);
      } else {
        setError('Error al cargar los pedidos');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Error al cargar los pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchUserOrders();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'pendiente':
        return <Clock className="status-icon pending" />;
      case 'procesando':
        return <Package className="status-icon processing" />;
      case 'enviado':
        return <Truck className="status-icon shipped" />;
      case 'entregado':
        return <CheckCircle className="status-icon delivered" />;
      case 'cancelado':
        return <XCircle className="status-icon cancelled" />;
      default:
        return <Clock className="status-icon pending" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pendiente':
        return '#f59e0b';
      case 'procesando':
        return '#3b82f6';
      case 'enviado':
        return '#8b5cf6';
      case 'entregado':
        return '#10b981';
      case 'cancelado':
        return '#ef4444';
      default:
        return '#6b7280';
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    }).format(amount);
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  if (!isAuthenticated) {
    return (
      <>
        <Topbar />
        <Header />
        <div className="orders-page">
          <div className="orders-container">
            <div className="orders-header">
              <h1>Mis Pedidos</h1>
              <p>Inicia sesión para ver tu historial de pedidos</p>
            </div>
            <div className="login-prompt">
              <Link href="/" className="login-btn">
                Ir al inicio
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Topbar />
        <Header />
        <div className="orders-page">
          <div className="orders-container">
            <div className="orders-header">
              <h1>Mis Pedidos</h1>
            </div>
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Cargando tus pedidos...</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Topbar />
        <Header />
        <div className="orders-page">
          <div className="orders-container">
            <div className="orders-header">
              <h1>Mis Pedidos</h1>
            </div>
            <div className="error-state">
              <p>{error}</p>
              <button onClick={fetchUserOrders} className="retry-btn">
                Reintentar
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Topbar />
      <Header />
      <div className="orders-page">
        <div className="orders-container">
          <div className="orders-header">
            <h1>Mis Pedidos</h1>
            <p>Gestiona y revisa el estado de tus pedidos</p>
          </div>

        {orders.length === 0 ? (
          <div className="empty-state">
            <Package className="empty-icon" />
            <h3>No tienes pedidos aún</h3>
            <p>Cuando realices tu primera compra, aparecerá aquí</p>
            <Link href="/catalog" className="shop-btn">
              Ir a comprar
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h3>Pedido #{order.codigo_orden}</h3>
                    <div className="order-date">
                      <Calendar size={16} />
                      <span>{formatDate(order.fecha_creacion)}</span>
                    </div>
                  </div>
                  <div className="order-status">
                    {getStatusIcon(order.estado)}
                    <span style={{ color: getStatusColor(order.estado) }}>
                      {order.estado}
                    </span>
                  </div>
                </div>

                <div className="order-details">
                  <div className="order-items">
                    {order.detalles?.slice(0, 3).map((detalle, index) => (
                      <div key={index} className="order-item">
                        <div className="item-image">
                          {detalle.producto?.imagenes?.[0]?.url ? (
                            <img 
                              src={detalle.producto.imagenes[0].url} 
                              alt={detalle.producto.nombre}
                              loading="lazy"
                            />
                          ) : (
                            <div className="no-image">
                              <Package size={20} />
                            </div>
                          )}
                        </div>
                        <div className="item-info">
                          <h4>{detalle.producto?.nombre || 'Producto'}</h4>
                          <p>Cantidad: {detalle.cantidad}</p>
                          {detalle.color && (
                            <div className="color-info">
                              <span 
                                className="color-dot" 
                                style={{ backgroundColor: detalle.color.hex }}
                              ></span>
                              <span>{detalle.color.nombre}</span>
                            </div>
                          )}
                        </div>
                        <div className="item-price">
                          {formatCurrency(detalle.precio_unitario)}
                        </div>
                      </div>
                    ))}
                    {order.detalles?.length > 3 && (
                      <div className="more-items">
                        +{order.detalles.length - 3} productos más
                      </div>
                    )}
                  </div>

                  <div className="order-summary">
                    <div className="summary-row">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(order.subtotal)}</span>
                    </div>
                    <div className="summary-row">
                      <span>Envío:</span>
                      <span>{formatCurrency(order.costo_envio)}</span>
                    </div>
                    <div className="summary-row total">
                      <span>Total:</span>
                      <span>{formatCurrency(order.total)}</span>
                    </div>
                  </div>
                </div>

                <div className="order-footer">
                  <div className="order-meta">
                    <div className="meta-item">
                      <CreditCard size={16} />
                      <span>{order.metodo_pago}</span>
                    </div>
                    {order.municipio_cliente && (
                      <div className="meta-item">
                        <MapPin size={16} />
                        <span>{order.municipio_cliente}</span>
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => handleViewOrder(order)}
                    className="view-order-btn"
                  >
                    <Eye size={16} />
                    Ver Detalles
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
      
      {/* Modal de detalles del pedido */}
      {showModal && selectedOrder && (
        <div className="order-modal-overlay" onClick={handleCloseModal}>
          <div className="order-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalles del Pedido #{selectedOrder.codigo_orden}</h2>
              <button className="modal-close-btn" onClick={handleCloseModal}>
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="modal-content">
              {/* Información general */}
              <div className="order-info-section">
                <div className="info-grid">
                  <div className="info-item">
                    <label>Fecha:</label>
                    <span>{formatDate(selectedOrder.fecha_creacion)}</span>
                  </div>
                  <div className="info-item">
                    <label>Estado:</label>
                    <span className={`status-badge ${selectedOrder.estado.toLowerCase()}`}>
                      {getStatusIcon(selectedOrder.estado)}
                      {selectedOrder.estado}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Método de Pago:</label>
                    <span>{selectedOrder.metodo_pago}</span>
                  </div>
                  <div className="info-item">
                    <label>Total:</label>
                    <span className="total-amount">{formatCurrency(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              {/* Productos */}
              <div className="products-section">
                <h3>Productos</h3>
                <div className="products-list">
                  {selectedOrder.detalles?.map((detalle, index) => (
                    <div key={index} className="product-detail-item">
                      <div className="product-image">
                        {detalle.producto?.imagenes?.[0]?.url ? (
                          <img 
                            src={detalle.producto.imagenes[0].url} 
                            alt={detalle.producto.nombre}
                            loading="lazy"
                          />
                        ) : (
                          <div className="no-image">
                            <Package size={24} />
                          </div>
                        )}
                      </div>
                      <div className="product-info">
                        <h4>{detalle.producto?.nombre || 'Producto'}</h4>
                        <div className="product-details">
                          <span>Cantidad: {detalle.cantidad}</span>
                          {detalle.color && (
                            <div className="color-info">
                              <span 
                                className="color-dot" 
                                style={{ backgroundColor: detalle.color.hex }}
                              ></span>
                              <span>{detalle.color.nombre}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="product-price">
                        {formatCurrency(detalle.precio_unitario)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Información del cliente */}
              <div className="customer-section">
                <h3>Información de Entrega</h3>
                <div className="customer-info">
                  <div className="info-row">
                    <label>Nombre:</label>
                    <span>{selectedOrder.nombre_cliente}</span>
                  </div>
                  <div className="info-row">
                    <label>Email:</label>
                    <span>{selectedOrder.email_cliente}</span>
                  </div>
                  <div className="info-row">
                    <label>Teléfono:</label>
                    <span>{selectedOrder.telefono_cliente}</span>
                  </div>
                  <div className="info-row">
                    <label>Dirección:</label>
                    <span>{selectedOrder.direccion_cliente}</span>
                  </div>
                  {selectedOrder.municipio_cliente && (
                    <div className="info-row">
                      <label>Municipio:</label>
                      <span>{selectedOrder.municipio_cliente}</span>
                    </div>
                  )}
                  {selectedOrder.codigo_postal_cliente && (
                    <div className="info-row">
                      <label>Código Postal:</label>
                      <span>{selectedOrder.codigo_postal_cliente}</span>
                    </div>
                  )}
                  {selectedOrder.nombre_quien_recibe && (
                    <div className="info-row">
                      <label>Recibe:</label>
                      <span>{selectedOrder.nombre_quien_recibe}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Resumen de precios */}
              <div className="summary-section">
                <h3>Resumen</h3>
                <div className="summary-details">
                  <div className="summary-row">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Envío:</span>
                    <span>{formatCurrency(selectedOrder.costo_envio)}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total:</span>
                    <span>{formatCurrency(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              {selectedOrder.notas && (
                <div className="notes-section">
                  <h3>Notas</h3>
                  <p>{selectedOrder.notas}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </>
  );
};

export default OrdersPage;
