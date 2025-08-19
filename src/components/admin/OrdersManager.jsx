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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Estados del formulario
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, paymentFilter, page]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams({
        status: statusFilter,
        paymentMethod: paymentFilter,
        page: page.toString(),
        limit: '20'
      });

      const response = await fetch(`/api/admin/orders?${params}`);
      const data = await response.json();

      if (response.ok) {
        setOrders(data.orders);
        setTotalPages(data.pagination.totalPages);
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
        
        alert('Pedido actualizado exitosamente');
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
        <h2>📦 Gestión de Pedidos</h2>
        <div className="filters">
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
                                     <p><strong>Municipio:</strong> {order.cliente.municipio}</p>
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
                       <p><strong>Comprobante:</strong> {order.comprobante_transferencia || 'No subido'}</p>
                       {order.comprobante_transferencia && (
                         <button 
                           onClick={() => {
                             setSelectedTransfer(order.comprobante_transferencia);
                             setShowTransferViewer(true);
                           }}
                           className="view-transfer-btn"
                         >
                           👁️ Ver Comprobante
                         </button>
                       )}
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
                
                {order.metodo_pago === 'transferencia' && !order.fecha_validacion_transferencia && (
                  <button 
                    onClick={() => openOrderModal(order)}
                    className="action-btn validate-btn"
                  >
                    🔍 Verificar Transferencia
                  </button>
                )}
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
              
                             {selectedOrder.metodo_pago === 'transferencia' && (
                 <div className="transfer-warning">
                   <p>⚠️ <strong>Transferencia Bancaria:</strong> Verifica el comprobante antes de cambiar el estado a "Validado"</p>
                   {selectedOrder.comprobante_transferencia && (
                     <p>📎 Comprobante: {selectedOrder.comprobante_transferencia}</p>
                   )}
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
                disabled={updating}
                className="save-btn"
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
