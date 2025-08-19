'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import '@/styles/CheckoutPage.css';

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Estados para productos
  const [productos, setProductos] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [error, setError] = useState('');
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    streetAddress: '',
    apartment: '',
    city: '',
    state: '',
    postcode: '',
    nit: '',
    phone: '',
    email: '',
    orderNotes: ''
  });
  
  // Estados de opciones
  const [metodoPago, setMetodoPago] = useState('contra_entrega');
  const [costoEnvio, setCostoEnvio] = useState(20); // Flat rate por defecto
  const [comprobanteTransferencia, setComprobanteTransferencia] = useState(null);
  const [createAccount, setCreateAccount] = useState(false);
  const [shipToDifferentAddress, setShipToDifferentAddress] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  // Estados de UI
  const [isLoading, setIsLoading] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState('flat_rate');

  // Cargar productos al montar el componente
  useEffect(() => {
    const productoId = searchParams.get('producto');
    const colorId = searchParams.get('color');
    const cantidad = searchParams.get('cantidad');

    if (productoId && colorId && cantidad) {
      cargarProductoEspecifico(productoId, colorId, parseInt(cantidad));
    } else {
      cargarProductosDelCarrito();
    }
  }, [searchParams]);

  // Cargar producto específico (para "Comprar ahora")
  const cargarProductoEspecifico = async (productoId, colorId, cantidad) => {
    try {
      setIsLoadingProducts(true);
      setError('');
      
      const response = await fetch(`/api/products/${productoId}`);
      const producto = await response.json();
      
      if (response.ok) {
        // Buscar el color específico
        const stockItem = producto.stock.find(item => item.color.id === parseInt(colorId));
        
        if (stockItem) {
          const productoConCantidad = {
            ...producto,
            cantidad: cantidad,
            precio: stockItem.precio,
            color: stockItem.color,
            stockId: stockItem.id
          };
          
          setProductos([productoConCantidad]);
        } else {
          setError('Color no disponible');
        }
      } else {
        setError('Error cargando el producto');
      }
    } catch (error) {
      console.error('Error cargando producto:', error);
      setError('Error cargando el producto');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Cargar productos del carrito
  const cargarProductosDelCarrito = async () => {
    try {
      setIsLoadingProducts(true);
      setError('');
      
      // Obtener usuario actual (si está logueado)
      const userId = 8; // Temporal - después implementar autenticación
      
      const response = await fetch(`/api/cart/${userId}`);
      const carrito = await response.json();
      
      if (response.ok && carrito.items && carrito.items.length > 0) {
        setProductos(carrito.items);
      } else {
        setError('Carrito vacío');
      }
    } catch (error) {
      console.error('Error cargando carrito:', error);
      setError('Error cargando el carrito');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar cambio de método de pago
  const handlePaymentMethodChange = (method) => {
    setMetodoPago(method);
    setComprobanteTransferencia(null); // Limpiar comprobante al cambiar método
  };

  // Manejar cambio de opción de envío
  const handleShippingChange = (option) => {
    setSelectedShipping(option);
    switch (option) {
      case 'flat_rate':
        setCostoEnvio(20);
        break;
      case 'local_pickup':
        setCostoEnvio(0);
        break;
      case 'free_shipping':
        setCostoEnvio(0);
        break;
      default:
        setCostoEnvio(20);
    }
  };

  // Manejar archivo de comprobante
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setComprobanteTransferencia(file);
    }
  };

  // Calcular totales
  const subtotal = productos.reduce((total, producto) => {
    return total + (producto.precio * producto.cantidad);
  }, 0);

  const total = subtotal + costoEnvio;

  // Validar formulario
  const isFormValid = () => {
    const requiredFields = ['firstName', 'lastName', 'streetAddress', 'city', 'state', 'postcode', 'phone', 'email'];
    const hasRequiredFields = requiredFields.every(field => formData[field].trim() !== '');
    
    if (metodoPago === 'transferencia' && !comprobanteTransferencia) {
      return false;
    }
    
    return hasRequiredFields && agreeToTerms;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      alert('Por favor completa todos los campos requeridos y acepta los términos');
      return;
    }

    setIsLoading(true);

    try {
      const orderData = {
        // Datos del cliente
        nombre_cliente: `${formData.firstName} ${formData.lastName}`,
        email_cliente: formData.email,
        telefono_cliente: formData.phone,
        direccion_cliente: `${formData.streetAddress}${formData.apartment ? `, ${formData.apartment}` : ''}`,
        ciudad_cliente: formData.city,
        codigo_postal_cliente: formData.postcode,
        nit_cliente: formData.nit,
        
        // Datos de la orden
        productos: productos,
        subtotal: subtotal,
        costo_envio: costoEnvio,
        total: total,
        metodo_pago: metodoPago,
        estado: 'pendiente',
        notas: formData.orderNotes,
        
        // Para transferencias
        comprobante_transferencia: comprobanteTransferencia ? comprobanteTransferencia.name : null
      };

      // Debug: Log what we're sending
      console.log('📤 Enviando datos a la API:', JSON.stringify(orderData, null, 2));

      // Llamada a la API para crear la orden
      const response = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (response.ok) {
        // Orden creada exitosamente
        router.push(`/checkout/confirmation?orderId=${result.orden.codigo_orden}`);
      } else {
        throw new Error(result.error || 'Error al procesar la orden');
      }

    } catch (error) {
      console.error('Error creando orden:', error);
      alert('Error al procesar la orden. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Mostrar loading mientras se cargan los productos
  if (isLoadingProducts) {
    return (
      <div className="checkout-page">
        <div className="sticky-wrapper">
          <Header />
        </div>
        <div className="checkout-main">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <div className="loading-text">Cargando productos...</div>
            <div className="loading-subtext">Preparando tu orden</div>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar error si hay algún problema
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

  // Mostrar carrito vacío solo si no hay productos y no está cargando
  if (productos.length === 0) {
    return (
      <div className="checkout-page">
        <div className="sticky-wrapper">
          <Header />
        </div>
        <div className="checkout-main">
          <div className="empty-state">
            <div className="empty-icon">🛒</div>
            <div className="empty-title">Carrito vacío</div>
            <div className="empty-message">No hay productos en tu carrito para procesar</div>
            <Link href="/catalog" className="empty-action">
              Continuar comprando
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
            <h1>Finalizar Compra</h1>
            <div className="breadcrumb">
              <span>Inicio</span>
              <span>•</span>
              <span>Carrito</span>
              <span>•</span>
              <span>Checkout</span>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="checkout-container">
          <div className="checkout-content">
            
            {/* Columna izquierda - Detalles de facturación */}
            <div className="billing-details-section">
              <div className="checkout-card">
                <div className="card-header">
                  <h2>Detalles de Facturación</h2>
                </div>
                <div className="card-body">
                  <form onSubmit={handleSubmit} className="billing-form">
                    
                    {/* Información personal */}
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label required">Nombre</label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="Tu nombre"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label required">Apellido</label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="Tu apellido"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group full-width">
                      <label className="form-label required">Dirección</label>
                      <input
                        type="text"
                        name="streetAddress"
                        value={formData.streetAddress}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Dirección de la calle"
                        required
                      />
                    </div>

                    <div className="form-group full-width">
                      <label className="form-label">Apartamento, suite, etc. (opcional)</label>
                      <input
                        type="text"
                        name="apartment"
                        value={formData.apartment}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Apartamento, suite, unidad, etc."
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label required">Ciudad</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="Ciudad"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label required">Estado</label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="Estado"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label required">Código Postal</label>
                        <input
                          type="text"
                          name="postcode"
                          value={formData.postcode}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="Código postal"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">NIT (Opcional)</label>
                        <input
                          type="text"
                          name="nit"
                          value={formData.nit}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="NIT de la empresa"
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label required">Teléfono</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="Tu teléfono"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label required">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="tu@email.com"
                          required
                        />
                      </div>
                    </div>



                    {/* Opciones de envío */}
                    <div className="form-group full-width">
                      <label className="form-label">Opciones de Envío</label>
                      <div className="shipping-options">
                        <div 
                          className={`shipping-option ${selectedShipping === 'flat_rate' ? 'selected' : ''}`}
                          onClick={() => handleShippingChange('flat_rate')}
                        >
                          <input
                            type="radio"
                            name="shipping"
                            value="flat_rate"
                            checked={selectedShipping === 'flat_rate'}
                            onChange={() => handleShippingChange('flat_rate')}
                            className="shipping-radio"
                          />
                          <div className="shipping-label">Tarifa plana</div>
                          <div className="shipping-price">$20.00</div>
                        </div>
                        
                        <div 
                          className={`shipping-option ${selectedShipping === 'local_pickup' ? 'selected' : ''}`}
                          onClick={() => handleShippingChange('local_pickup')}
                        >
                          <input
                            type="radio"
                            name="shipping"
                            value="local_pickup"
                            checked={selectedShipping === 'local_pickup'}
                            onChange={() => handleShippingChange('local_pickup')}
                            className="shipping-radio"
                          />
                          <div className="shipping-label">Recogida local</div>
                          <div className="shipping-price">$0.00</div>
                        </div>
                        
                        <div 
                          className={`shipping-option ${selectedShipping === 'free_shipping' ? 'selected' : ''}`}
                          onClick={() => handleShippingChange('free_shipping')}
                        >
                          <input
                            type="radio"
                            name="shipping"
                            value="free_shipping"
                            checked={selectedShipping === 'free_shipping'}
                            onChange={() => handleShippingChange('free_shipping')}
                            className="shipping-radio"
                          />
                          <div className="shipping-label">Envío gratis</div>
                          <div className="shipping-price">$0.00</div>
                        </div>
                      </div>
                    </div>

                    {/* Métodos de pago */}
                    <div className="form-group full-width">
                      <label className="form-label">Método de Pago</label>
                      <div className="payment-methods">
                        <div 
                          className={`payment-method ${metodoPago === 'contra_entrega' ? 'selected' : ''}`}
                          onClick={() => handlePaymentMethodChange('contra_entrega')}
                        >
                          <input
                            type="radio"
                            name="payment"
                            value="contra_entrega"
                            checked={metodoPago === 'contra_entrega'}
                            onChange={() => handlePaymentMethodChange('contra_entrega')}
                            className="payment-radio"
                          />
                          <div className="payment-content">
                            <div className="payment-label">Pago contra entrega</div>
                            <div className="payment-description">
                              Paga en efectivo cuando recibas tu pedido. Solo disponible para envíos locales.
                            </div>
                          </div>
                        </div>
                        
                        <div 
                          className={`payment-method ${metodoPago === 'transferencia' ? 'selected' : ''}`}
                          onClick={() => handlePaymentMethodChange('transferencia')}
                        >
                          <input
                            type="radio"
                            name="payment"
                            value="transferencia"
                            checked={metodoPago === 'transferencia'}
                            onChange={() => handlePaymentMethodChange('transferencia')}
                            className="payment-radio"
                          />
                          <div className="payment-content">
                            <div className="payment-label">Pago con transferencia</div>
                            <div className="payment-description">
                              Realiza una transferencia bancaria. Deberás subir el comprobante para validar tu orden.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Upload de comprobante (solo para transferencias) */}
                    {metodoPago === 'transferencia' && (
                      <div className="form-group full-width">
                        <label className="form-label required">Comprobante de Transferencia</label>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleFileChange}
                          className="file-input"
                          required
                        />
                        {comprobanteTransferencia && (
                          <div style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--success-color)' }}>
                            ✓ Archivo seleccionado: {comprobanteTransferencia.name}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Notas de la orden */}
                    <div className="form-group full-width">
                      <label className="form-label">Notas de la Orden (Opcional)</label>
                      <textarea
                        name="orderNotes"
                        value={formData.orderNotes}
                        onChange={handleInputChange}
                        className="form-input form-textarea"
                        placeholder="Notas especiales para tu orden..."
                      />
                    </div>

                    {/* Checkboxes adicionales */}
                    <div className="form-checkbox-group">
                      <input
                        type="checkbox"
                        id="createAccount"
                        checked={createAccount}
                        onChange={(e) => setCreateAccount(e.target.checked)}
                        className="form-checkbox"
                      />
                      <label htmlFor="createAccount" className="form-checkbox-label">
                        Crear una cuenta para hacer seguimiento de mi orden
                      </label>
                    </div>

                    <div className="form-checkbox-group">
                      <input
                        type="checkbox"
                        id="shipToDifferentAddress"
                        checked={shipToDifferentAddress}
                        onChange={(e) => setShipToDifferentAddress(e.target.checked)}
                        className="form-checkbox"
                      />
                      <label htmlFor="shipToDifferentAddress" className="form-checkbox-label">
                        Enviar a una dirección diferente
                      </label>
                    </div>

                    <div className="form-checkbox-group">
                      <input
                        type="checkbox"
                        id="agreeToTerms"
                        checked={agreeToTerms}
                        onChange={(e) => setAgreeToTerms(e.target.checked)}
                        className="form-checkbox"
                        required
                      />
                      <label htmlFor="agreeToTerms" className="form-checkbox-label">
                        He leído y acepto los <Link href="/terms" style={{ color: 'var(--primary-orange)' }}>términos y condiciones</Link> *
                      </label>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Columna derecha - Resumen de la orden */}
            <div className="order-summary-section">
              <div className="checkout-card order-summary">
                <div className="card-header">
                  <h2>Tu Orden</h2>
                </div>
                <div className="card-body">
                  
                  {/* Lista de productos */}
                  <div className="order-items">
                    {productos.map((producto, index) => (
                      <div key={index} className="order-item">
                        <img
                          src={producto.imagenes?.[0]?.url || '/assets/placeholder.jpg'}
                          alt={producto.nombre}
                          className="item-image"
                        />
                        <div className="item-details">
                          <div className="item-name">{producto.nombre}</div>
                          <div className="item-meta">
                            Cantidad: {producto.cantidad} | 
                            Color: {producto.color?.nombre || 'N/A'}
                          </div>
                        </div>
                        <div className="item-price">
                          ${(producto.precio * producto.cantidad).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totales */}
                  <div className="order-totals">
                    <div className="total-row">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="total-row">
                      <span>Envío</span>
                      <span>${costoEnvio.toFixed(2)}</span>
                    </div>
                    <div className="total-row final">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Botón de orden */}
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={!isFormValid() || isLoading}
                    className="place-order-btn"
                  >
                    {isLoading ? 'Procesando...' : 'Realizar Pedido'}
                  </button>
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
