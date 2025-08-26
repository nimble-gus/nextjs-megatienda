'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import '@/styles/OrdersPage.css';

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(9);

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

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeOrderDetails = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
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

  // Funciones de paginación
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
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
              {currentOrders.map((order) => (
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
                        <Image
                          src={item.producto?.imagenes?.[0]?.url || '/assets/placeholder.jpg'}
                          alt={item.producto?.nombre || 'Producto'}
                          width={60}
                          height={60}
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
                      <button 
                        onClick={() => openOrderDetails(order)}
                        className="view-details-btn"
                      >
                        Ver Detalles
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Paginación */}
              {totalPages > 1 && (
                <div className="pagination-container">
                  <div className="pagination-info">
                    Mostrando {indexOfFirstOrder + 1}-{Math.min(indexOfLastOrder, orders.length)} de {orders.length} pedidos
                  </div>
                  <div className="pagination-controls">
                    <button
                      className="pagination-btn"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                    >
                      ← Anterior
                    </button>
                    
                    {getPageNumbers().map((pageNumber, index) => (
                      <button
                        key={index}
                        className={`pagination-btn ${pageNumber === currentPage ? 'active' : ''} ${pageNumber === '...' ? 'disabled' : ''}`}
                        onClick={() => pageNumber !== '...' && handlePageChange(pageNumber)}
                        disabled={pageNumber === '...'}
                      >
                        {pageNumber}
                      </button>
                    ))}
                    
                    <button
                      className="pagination-btn"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                    >
                      Siguiente →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de detalles del pedido */}
      {isModalOpen && selectedOrder && (
        <div className="order-modal-overlay" onClick={closeOrderDetails}>
          <div className="order-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalles del Pedido #{selectedOrder.codigo_orden}</h2>
              <button className="modal-close-btn" onClick={closeOrderDetails}>
                ×
              </button>
            </div>
            
            <div className="modal-content">
              {/* Información del pedido */}
              <div className="order-info-section">
                <div className="info-grid">
                  <div className="info-item">
                    <label>Fecha del Pedido:</label>
                    <span>{formatDate(selectedOrder.fecha_creacion)}</span>
                  </div>
                  <div className="info-item">
                    <label>Estado:</label>
                    <span className={`status-badge ${getStatusColor(selectedOrder.estado)}`}>
                      {getStatusText(selectedOrder.estado)}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Método de Pago:</label>
                    <span>{selectedOrder.metodo_pago === 'contra_entrega' ? 'Contra Entrega' : 'Transferencia'}</span>
                  </div>
                  {selectedOrder.notas && (
                    <div className="info-item full-width">
                      <label>Notas:</label>
                      <span>{selectedOrder.notas}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Información del cliente */}
              <div className="customer-info-section">
                <h3>Información de Entrega</h3>
                <div className="customer-details">
                  <p><strong>Nombre:</strong> {selectedOrder.nombre_cliente || 'No especificado'}</p>
                  <p><strong>Email:</strong> {selectedOrder.email_cliente || 'No especificado'}</p>
                  <p><strong>Teléfono:</strong> {selectedOrder.telefono_cliente || 'No especificado'}</p>
                  <p><strong>Dirección:</strong> {selectedOrder.direccion_cliente || 'No especificada'}</p>
                  <p><strong>Municipio:</strong> {selectedOrder.municipio_cliente || 'No especificado'}</p>
                  <p><strong>Código Postal:</strong> {selectedOrder.codigo_postal_cliente || 'No especificado'}</p>
                  {selectedOrder.nit_cliente && (
                    <p><strong>NIT:</strong> {selectedOrder.nit_cliente}</p>
                  )}
                </div>
              </div>

              {/* Productos del pedido */}
              <div className="products-section">
                <h3>Productos</h3>
                <div className="products-list">
                  {selectedOrder.detalles?.map((item, index) => (
                    <div key={index} className="product-item">
                      <Image
                        src={item.producto?.imagenes?.[0]?.url || '/assets/placeholder.jpg'}
                        alt={item.producto?.nombre || 'Producto'}
                        width={80}
                        height={80}
                        className="product-image"
                      />
                      <div className="product-details">
                        <h4>{item.producto?.nombre || 'Producto no disponible'}</h4>
                        <p><strong>Cantidad:</strong> {item.cantidad}</p>
                        <p><strong>Color:</strong> {item.color?.nombre || 'N/A'}</p>
                        <p><strong>Precio unitario:</strong> {formatPrice(item.precio_unitario)}</p>
                        <p><strong>Subtotal:</strong> {formatPrice(item.precio_unitario * item.cantidad)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resumen financiero */}
              <div className="financial-summary">
                <h3>Resumen Financiero</h3>
                <div className="summary-grid">
                  <div className="summary-item">
                    <span>Subtotal:</span>
                    <span>{formatPrice(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="summary-item">
                    <span>Envío:</span>
                    <span>{formatPrice(selectedOrder.costo_envio)}</span>
                  </div>
                  <div className="summary-item total">
                    <span>Total:</span>
                    <span>{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
}
