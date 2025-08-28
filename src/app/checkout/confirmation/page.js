'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import '@/styles/CheckoutPage.css';

export default function CheckoutConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  
  const [orden, setOrden] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (orderId) {
      cargarOrden(orderId);
    } else {
      setError('No se proporcionó ID de orden');
      setIsLoading(false);
    }
  }, [orderId]);

  const cargarOrden = async (id) => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await fetch(`/api/orders/${id}`);
      const data = await response.json();
      
      if (response.ok) {
        setOrden(data.orden);
      } else {
        setError(data.error || 'Error cargando la orden');
      }
    } catch (error) {
      console.error('Error cargando orden:', error);
      setError('Error cargando la orden');
    } finally {
      setIsLoading(false);
    }
  };

  // Mostrar loading
  if (isLoading) {
    return (
      <div className="checkout-page">
        <div className="sticky-wrapper">
          <Header />
        </div>
        <div className="checkout-main">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <div className="loading-text">Cargando confirmación...</div>
            <div className="loading-subtext">Preparando los detalles de tu orden</div>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar error
  if (error) {
    return (
      <div className="checkout-page">
        <div className="sticky-wrapper">
          <Header />
        </div>
        <div className="checkout-main">
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <div className="error-title">Error</div>
            <div className="error-message">{error}</div>
            <Link href="/catalog" className="error-action">
              Ir al catálogo
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="sticky-wrapper">
        <Header />
      </div>
      
      <div className="checkout-main">
        {/* Header de la página */}
        <div className="page-header">
          <div className="page-header-content">
            <h1>¡Orden Confirmada!</h1>
            <div className="breadcrumb">
              <span>Inicio</span>
              <span>•</span>
              <span>Checkout</span>
              <span>•</span>
              <span>Confirmación</span>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="checkout-container">
          <div className="checkout-content">
            
            {/* Columna izquierda - Detalles de la orden */}
            <div className="billing-details-section">
              <div className="checkout-card">
                <div className="card-header">
                  <h2>Detalles de la Orden</h2>
                </div>
                <div className="card-body">
                  
                  {/* Mensaje de éxito */}
                  <div style={{ 
                    background: '#d4edda', 
                    color: '#155724', 
                    padding: '20px', 
                    borderRadius: '8px', 
                    marginBottom: '30px',
                    border: '1px solid #c3e6cb'
                  }}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>
                      ✅ ¡Tu orden ha sido procesada exitosamente!
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.95rem' }}>
                      Hemos recibido tu pedido y te enviaremos una confirmación por email.
                      Puedes hacer seguimiento de tu orden usando el código de orden.
                    </p>
                  </div>

                  {/* Información de la orden */}
                  <div style={{ marginBottom: '30px' }}>
                    <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Información de la Orden</h3>
                    <div style={{ display: 'grid', gap: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: '600', color: '#000' }}>Código de Orden:</span>
                        <span style={{ fontFamily: 'monospace', color: '#007bff' }}>
                          {orden?.codigo_orden || orderId}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: '600', color: '#000' }}>Fecha:</span>
                        <span style={{ color: '#000' }}>
                          {orden?.fecha ? new Date(orden.fecha).toLocaleDateString('es-ES') : 'N/A'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: '600', color: '#000' }}>Estado:</span>
                        <span style={{ 
                          color: orden?.estado === 'pendiente' ? '#ffc107' : '#28a745',
                          fontWeight: '600'
                        }}>
                          {orden?.estado?.toUpperCase() || 'PENDIENTE'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: '600', color: '#000' }}>Método de Pago:</span>
                        <span style={{ color: '#000' }}>
                          {orden?.metodo_pago === 'contra_entrega' ? 'Contra Entrega' : 'Transferencia'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Información del cliente */}
                  <div style={{ marginBottom: '30px' }}>
                    <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Información de Envío</h3>
                    <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
                                             <p style={{ margin: '0 0 10px 0', fontWeight: '600', color: '#000' }}>
                         {orden?.nombre_cliente}
                       </p>
                      {orden?.nombre_quien_recibe && (
                        <p style={{ margin: '0 0 5px 0', color: '#000', fontStyle: 'italic' }}>
                          <strong>Quien Recibe:</strong> {orden.nombre_quien_recibe}
                        </p>
                      )}
                      <p style={{ margin: '0 0 5px 0', color: '#000' }}>
                        {orden?.direccion_cliente}
                      </p>
                      <p style={{ margin: '0 0 5px 0', color: '#000' }}>
                        {orden?.municipio_cliente}, {orden?.codigo_postal_cliente}
                      </p>
                      <p style={{ margin: '0 0 5px 0', color: '#000' }}>
                        Tel: {orden?.telefono_cliente}
                      </p>
                      <p style={{ margin: '0 0 5px 0', color: '#000' }}>
                        Email: {orden?.email_cliente}
                      </p>
                      {orden?.nit_cliente && (
                        <p style={{ margin: '0', color: '#000' }}>
                          NIT: {orden.nit_cliente}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Notas */}
                  {orden?.notas && (
                    <div style={{ marginBottom: '30px' }}>
                      <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Notas de la Orden</h3>
                      <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
                        <p style={{ margin: 0, fontStyle: 'italic', color: '#000' }}>{orden.notas}</p>
                      </div>
                    </div>
                  )}

                  {/* Próximos pasos */}
                  <div>
                    <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Próximos Pasos</h3>
                    <div style={{ background: '#e7f3ff', padding: '20px', borderRadius: '8px', border: '1px solid #b3d9ff' }}>
                      <ul style={{ margin: 0, paddingLeft: '20px' }}>
                        <li style={{ marginBottom: '8px', color: '#000' }}>
                          Recibirás una confirmación por email en los próximos minutos
                        </li>
                        <li style={{ marginBottom: '8px', color: '#000' }}>
                          Procesaremos tu orden y te contactaremos si necesitamos información adicional
                        </li>
                        <li style={{ marginBottom: '8px', color: '#000' }}>
                          Una vez confirmado el pago, prepararemos tu envío
                        </li>
                        <li style={{ color: '#000' }}>
                          Te enviaremos actualizaciones sobre el estado de tu pedido
                        </li>
                      </ul>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Columna derecha - Resumen de la orden */}
            <div className="order-summary-section">
              <div className="checkout-card order-summary">
                <div className="card-header">
                  <h2>Resumen de la Orden</h2>
                </div>
                <div className="card-body">
                  
                  {/* Lista de productos */}
                  <div className="order-items">
                    {orden?.detalle?.map((item, index) => (
                      <div key={index} className="order-item">
                        <Image
                          src={item.producto?.url_imagen || 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/accessories-bag'}
                          alt={item.producto?.nombre || 'Producto'}
                          width={80}
                          height={80}
                          className="item-image"
                          onError={(e) => {
                            e.target.src = 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/accessories-bag';
                          }}
                        />
                        <div className="item-details">
                          <div className="item-name">{item.producto?.nombre}</div>
                          <div className="item-meta">
                            Cantidad: {item.cantidad} | 
                            Color: {item.color?.nombre || 'N/A'}
                          </div>
                        </div>
                        <div className="item-price">
                          Q{(item.precio_unitario * item.cantidad).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totales */}
                  <div className="order-totals">
                    <div className="total-row">
                      <span>Subtotal</span>
                      <span>Q{orden?.subtotal?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="total-row">
                      <span>Envío</span>
                      <span>Q{orden?.costo_envio?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="total-row final">
                      <span>Total</span>
                      <span>Q{orden?.total?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div style={{ marginTop: '24px' }}>
                    <Link 
                      href="/catalog" 
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '16px 24px',
                        background: '#28a745',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '8px',
                        textAlign: 'center',
                        fontWeight: '700',
                        marginBottom: '12px',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseOver={(e) => e.target.style.background = '#218838'}
                      onMouseOut={(e) => e.target.style.background = '#28a745'}
                    >
                      Continuar Comprando
                    </Link>
                    
                    <Link 
                      href="/" 
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '12px 24px',
                        background: 'transparent',
                        color: '#007bff',
                        textDecoration: 'none',
                        borderRadius: '8px',
                        textAlign: 'center',
                        fontWeight: '600',
                        border: '2px solid #007bff',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.background = '#007bff';
                        e.target.style.color = 'white';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.background = 'transparent';
                        e.target.style.color = '#007bff';
                      }}
                    >
                      Ir al Inicio
                    </Link>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
