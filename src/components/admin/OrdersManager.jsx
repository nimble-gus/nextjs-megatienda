'use client';

import { useState, useEffect } from 'react';
import TransferViewer from './TransferViewer';
import '@/styles/OrdersManager.css';

const OrdersManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showTransferViewer, setShowTransferViewer] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  
  // Filtros
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [searchOrder, setSearchOrder] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  // Estados del formulario
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [transferVerified, setTransferVerified] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, paymentFilter, searchOrder, page]);

  // Escuchar eventos de nuevas órdenes para actualizar en tiempo real
  useEffect(() => {
    const handleNewOrder = () => {
      console.log('📢 Nueva orden recibida, actualizando lista...');
      fetchOrders();
    };

    const handleOrderProcessed = () => {
      console.log('📢 Orden procesada, actualizando lista...');
      fetchOrders();
    };

    window.addEventListener('newOrderCreated', handleNewOrder);
    window.addEventListener('orderProcessed', handleOrderProcessed);

    return () => {
      window.removeEventListener('newOrderCreated', handleNewOrder);
      window.removeEventListener('orderProcessed', handleOrderProcessed);
    };
  }, []);

  // Resetear página cuando se cambia la búsqueda
  useEffect(() => {
    setPage(1);
  }, [searchOrder]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams({
        status: statusFilter,
        paymentMethod: paymentFilter,
        search: searchOrder,
        page: page.toString(),
        limit: '20'
      });

      const response = await fetch(`/api/admin/orders?${params}`);
      const data = await response.json();

      if (response.ok) {
        setOrders(data.orders);
        setTotalPages(data.pagination.totalPages);
        setTotalOrders(data.pagination.total);
      } else {
        setError(data.error || 'Error cargando pedidos');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return;

    // Validación para transferencias bancarias pendientes
    if (selectedOrder.metodo_pago === 'transferencia' && 
        selectedOrder.estado === 'pendiente' && 
        !transferVerified) {
      alert('⚠️ Debes marcar que has revisado el comprobante de transferencia antes de guardar los cambios.');
      return;
    }

    // Validación para cancelación
    if (newStatus === 'cancelado' && selectedOrder.estado === 'cancelado') {
      alert('⚠️ Este pedido ya está cancelado.');
      return;
    }

    // Confirmación para cancelación
    if (newStatus === 'cancelado' && selectedOrder.estado !== 'cancelado') {
      const confirmCancel = confirm(
        `¿Estás seguro de que quieres cancelar el pedido #${selectedOrder.codigo_orden}?\n\n` +
        '⚠️ Esta acción regresará automáticamente el stock al inventario.'
      );
      
      if (!confirmCancel) {
        return;
      }
    }

    try {
      setUpdating(true);
      
      const response = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          estado: newStatus,
          notas: notes,
          validado_por: 1 // ID del admin (puedes obtenerlo del contexto de autenticación)
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Actualizar la lista de pedidos
        setOrders(orders.map(order => 
          order.id === selectedOrder.id 
            ? { ...order, estado: newStatus, notas: notes }
            : order
        ));
        
        setShowModal(false);
        setSelectedOrder(null);
        setNewStatus('');
        setNotes('');
        
        // Mostrar mensaje específico si se canceló el pedido
        if (data.stockUpdated) {
          let message = data.message;
          
          // Agregar detalles de stock si están disponibles
          if (data.stockUpdates && data.stockUpdates.length > 0) {
            message += '\n\n📦 Stock regresado:';
            data.stockUpdates.forEach(update => {
              message += `\n• ${update.producto} (${update.color}): +${update.cantidad} unidades`;
            });
          }
          
          // Agregar errores de stock si los hay
          if (data.stockErrors && data.stockErrors.length > 0) {
            message += '\n\n⚠️ Errores de stock:';
            data.stockErrors.forEach(error => {
              message += `\n• ${error}`;
            });
          }
          
          alert(message);
        } else {
          alert('Pedido actualizado exitosamente');
        }
      } else {
        alert(data.error || 'Error actualizando pedido');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Error de conexión');
    } finally {
      setUpdating(false);
    }
  };

  const openOrderModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.estado);
    setNotes(order.notas || '');
    setTransferVerified(false); // Resetear checkbox
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      pendiente: '#f59e0b',
      pagado: '#3b82f6',
      validado: '#8b5cf6',
      en_preparacion: '#06b6d4',
      enviado: '#8b5cf6',
      entregado: '#10b981',
      cancelado: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusText = (status) => {
    const texts = {
      pendiente: 'Pendiente',
      pagado: 'Pagado',
      validado: 'Validado',
      en_preparacion: 'En Preparación',
      enviado: 'Enviado',
      entregado: 'Entregado',
      cancelado: 'Cancelado'
    };
    return texts[status] || status;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="orders-manager-loading">
        <div className="loading-spinner"></div>
        <p>Cargando pedidos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-manager-error">
        <p>Error: {error}</p>
        <button onClick={fetchOrders} className="retry-btn">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="orders-manager">
      <div className="orders-header">
        <div className="header-left">
          <h2>📦 Gestión de Pedidos</h2>
          <span className="orders-count">
            {searchOrder && (
              <span className="search-indicator">
                🔍 Buscando: "{searchOrder}"
              </span>
            )}
            {totalOrders > 0 && `${totalOrders} pedido${totalOrders !== 1 ? 's' : ''} encontrado${totalOrders !== 1 ? 's' : ''}`}
          </span>
        </div>
                <div className="filters">
          <div className="search-container">
            <input
              type="text"
              placeholder="🔍 Buscar por número de orden..."
              value={searchOrder}
              onChange={(e) => setSearchOrder(e.target.value)}
              className="search-input"
            />
            {searchOrder && (
              <button
                onClick={() => setSearchOrder('')}
                className="clear-search-btn"
                title="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>
          
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="pagado">Pagado</option>
            <option value="validado">Validado</option>
            <option value="en_preparacion">En Preparación</option>
            <option value="enviado">Enviado</option>
            <option value="entregado">Entregado</option>
            <option value="cancelado">Cancelado</option>
          </select>
          
          <select 
            value={paymentFilter} 
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Todos los pagos</option>
            <option value="contra_entrega">Contra entrega</option>
            <option value="transferencia">Transferencia</option>
          </select>
        </div>
      </div>

      <div className="orders-list">
        {orders.length === 0 ? (
          <div className="no-orders">
            <p>No hay pedidos que coincidan con los filtros</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <h3>Pedido #{order.codigo_orden}</h3>
                  <p className="order-date">{formatDate(order.fecha)}</p>
                </div>
                <div className="order-status">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(order.estado) }}
                  >
                    {getStatusText(order.estado)}
                  </span>
                </div>
              </div>

              <div className="order-details">
                <div className="customer-info">
                  <h4>Cliente</h4>
                  <p><strong>Nombre:</strong> {order.cliente.nombre}</p>
                  <p><strong>Email:</strong> {order.cliente.email}</p>
                  <p><strong>Teléfono:</strong> {order.cliente.telefono}</p>
                  <p><strong>Dirección:</strong> {order.cliente.direccion}</p>
                  <p><strong>Municipio:</strong> {order.cliente.municipio}</p>
                  {order.cliente.departamento && (
                    <p><strong>Departamento:</strong> {order.cliente.departamento}</p>
                  )}
                  {order.nombre_quien_recibe && (
                    <p><strong>Quien Recibe:</strong> {order.nombre_quien_recibe}</p>
                  )}
                  {order.cliente.nit && (
                    <p><strong>NIT:</strong> {order.cliente.nit}</p>
                  )}
                </div>

                <div className="payment-info">
                  <h4>Pago</h4>
                  <p><strong>Método:</strong> {order.metodo_pago === 'transferencia' ? 'Transferencia Bancaria' : 'Contra Entrega'}</p>
                  <p><strong>Total:</strong> {formatPrice(order.total)}</p>
                  
                                     {order.metodo_pago === 'transferencia' && (
                     <div className="transfer-info">
                       <div className="comprobante-section">
                         <p><strong>Comprobante:</strong></p>
                         {order.comprobante_transferencia ? (
                           <button 
                             onClick={() => {
                               setSelectedTransfer(order.comprobante_transferencia);
                               setShowTransferViewer(true);
                             }}
                             className="view-transfer-btn"
                           >
                             👁️ Ver Comprobante
                           </button>
                         ) : (
                           <span className="no-comprobante">No subido</span>
                         )}
                       </div>
                       {order.fecha_validacion_transferencia && (
                         <p><strong>Validado:</strong> {formatDate(order.fecha_validacion_transferencia)}</p>
                       )}
                     </div>
                   )}
                </div>

                <div className="products-info">
                  <h4>Productos ({order.productos.length})</h4>
                  <div className="products-list">
                    {order.productos.map((producto, index) => (
                      <div key={index} className="product-item">
                        <img 
                          src={producto.producto.imagen || 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/accessories-bag'} 
                          alt={producto.producto.nombre}
                          className="product-image"
                        />
                        <div className="product-details">
                          <p><strong>{producto.producto.nombre}</strong></p>
                          <p>Cantidad: {producto.cantidad}</p>
                          <p>Color: {producto.color.nombre}</p>
                          <p>Precio: {formatPrice(producto.precio_unitario)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {order.notas && (
                  <div className="order-notes">
                    <h4>Notas</h4>
                    <p>{order.notas}</p>
                  </div>
                )}
              </div>

              <div className="order-actions">
                <button 
                  onClick={() => openOrderModal(order)}
                  className="action-btn edit-btn"
                >
                  ✏️ Editar Estado
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="pagination-btn"
          >
            ← Anterior
          </button>
          
          {/* Números de página */}
          <div className="page-numbers">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNumber;
              if (totalPages <= 5) {
                pageNumber = i + 1;
              } else if (page <= 3) {
                pageNumber = i + 1;
              } else if (page >= totalPages - 2) {
                pageNumber = totalPages - 4 + i;
              } else {
                pageNumber = page - 2 + i;
              }
              
              return (
                <button
                  key={pageNumber}
                  onClick={() => setPage(pageNumber)}
                  className={`pagination-btn ${page === pageNumber ? 'active' : ''}`}
                >
                  {pageNumber}
                </button>
              );
            })}
          </div>
          
          <span className="page-info">
            Página {page} de {totalPages}
          </span>
          
          <button 
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            className="pagination-btn"
          >
            Siguiente →
          </button>
        </div>
      )}

      {/* Modal para editar pedido */}
      {showModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Pedido #{selectedOrder.codigo_orden}</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="close-btn"
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Estado del Pedido</label>
                                 <select 
                   value={newStatus} 
                   onChange={(e) => setNewStatus(e.target.value)}
                   className="form-select"
                 >
                   <option value="pendiente">Pendiente</option>
                   <option value="pagado">Pagado</option>
                   <option value="validado">Validado</option>
                   <option value="en_preparacion">En Preparación</option>
                   <option value="enviado">Enviado</option>
                   <option value="entregado">Entregado</option>
                   <option value="cancelado">Cancelado</option>
                 </select>
              </div>
              
              <div className="form-group">
                <label>Notas (opcional)</label>
                <textarea 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)}
                  className="form-textarea"
                  placeholder="Agregar notas sobre el pedido..."
                />
              </div>
              
                                           {selectedOrder.metodo_pago === 'transferencia' && selectedOrder.estado === 'pendiente' && (
                <div className="transfer-verification">
                  <div className="transfer-warning">
                    <p>⚠️ <strong>Transferencia Bancaria:</strong> Debes verificar el comprobante antes de proceder</p>
                    {selectedOrder.comprobante_transferencia && (
                      <div className="transfer-actions">
                        <p>📎 Comprobante disponible</p>
                        <button 
                          type="button"
                          onClick={() => {
                            setSelectedTransfer(selectedOrder.comprobante_transferencia);
                            setShowTransferViewer(true);
                          }}
                          className="view-transfer-btn"
                        >
                          👁️ Ver Comprobante
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="verification-checkbox">
                    <label className={`checkbox-label ${transferVerified ? 'checked' : ''}`}>
                      <input 
                        type="checkbox"
                        checked={transferVerified}
                        onChange={(e) => setTransferVerified(e.target.checked)}
                        className="verification-checkbox-input"
                      />
                      <span className="checkmark"></span>
                      <span className="checkbox-text">
                        ✅ He revisado y verificado el comprobante de transferencia
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button 
                onClick={() => setShowModal(false)}
                className="cancel-btn"
              >
                Cancelar
              </button>
              <button 
                onClick={handleStatusUpdate}
                disabled={updating || (selectedOrder.metodo_pago === 'transferencia' && selectedOrder.estado === 'pendiente' && !transferVerified)}
                className="save-btn"
                title={
                  selectedOrder.metodo_pago === 'transferencia' && selectedOrder.estado === 'pendiente' && !transferVerified 
                    ? 'Debes verificar el comprobante de transferencia primero'
                    : ''
                }
              >
                {updating ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visor de comprobantes de transferencia */}
      {showTransferViewer && selectedTransfer && (
        <TransferViewer
          comprobanteUrl={selectedTransfer}
          onClose={() => {
            setShowTransferViewer(false);
            setSelectedTransfer(null);
          }}
        />
      )}
    </div>
  );
};

export default OrdersManager;
