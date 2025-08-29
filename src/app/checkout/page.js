'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppCheckout from '@/components/Checkout/WhatsAppCheckout';
import '@/styles/CheckoutPage.css';

function CheckoutPageContent() {
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
    nombreQuienRecibe: '',
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
  const [costoEnvio, setCostoEnvio] = useState(0); // Envío gratis por defecto
  const [comprobanteTransferencia, setComprobanteTransferencia] = useState(null);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  // Estados de UI
  const [isLoading, setIsLoading] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState('free_shipping');
  const [queuePosition, setQueuePosition] = useState(null);
  const [processingStatus, setProcessingStatus] = useState('');
  const [showWhatsAppCheckout, setShowWhatsAppCheckout] = useState(false);

  // Cargar productos al montar el componente
  useEffect(() => {
    const productoId = searchParams.get('producto');
    const colorId = searchParams.get('color');
    const cantidad = searchParams.get('cantidad');

    if (productoId && colorId && cantidad) {
      cargarProductoEspecifico(productoId, colorId, parseInt(cantidad));
    } else {
      // Redirigir al catálogo si no hay productos
      router.push('/catalog');
    }
  }, [searchParams, router]);

  // Cargar producto específico (para "Comprar ahora")
  const cargarProductoEspecifico = async (productoId, colorId, cantidad) => {
    try {
      setIsLoadingProducts(true);
      setError('');
      
      const response = await fetch(`/api/products/${productoId}`);
      const producto = await response.json();
      
      if (response.ok) {
        // Buscar el color específico
        const colorItem = producto.colors.find(color => color.id === parseInt(colorId));
        
        if (colorItem) {
          const productoConCantidad = {
            ...producto,
            nombre: producto.name, // Asegurar que el nombre esté disponible
            url_imagen: producto.mainImage, // Usar la imagen principal del producto
            cantidad: cantidad,
            precio: colorItem.price,
            color: {
              id: colorItem.id,
              nombre: colorItem.name,
              hex: colorItem.hex
            },
            stockId: colorItem.id // Usar el color ID como stockId
          };

          setProductos([productoConCantidad]);
        } else {
          setError('Color no disponible');
        }
      } else {
        setError('Error al cargar el producto');
      }
    } catch (error) {
      console.error('Error cargando producto:', error);
      setError('Error al cargar el producto');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Calcular totales
  const subtotal = productos.reduce((total, producto) => {
    return total + (producto.precio * producto.cantidad);
  }, 0);

  const total = subtotal + costoEnvio;

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
    setComprobanteTransferencia(null);
  };

  // Manejar cambio de método de envío
  const handleShippingChange = (method) => {
    setSelectedShipping(method);
    switch (method) {
      case 'free_shipping':
        setCostoEnvio(0);
        break;
      case 'standard_shipping':
        setCostoEnvio(25);
        break;
      case 'express_shipping':
        setCostoEnvio(50);
        break;
      default:
        setCostoEnvio(0);
    }
  };

  // Manejar archivo de comprobante
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setComprobanteTransferencia(file);
    } else {
      alert('Por favor selecciona una imagen válida');
    }
  };

  // Validar formulario
  const validateForm = () => {
    const requiredFields = ['firstName', 'lastName', 'streetAddress', 'city', 'phone', 'email'];
    
    for (const field of requiredFields) {
      if (!formData[field].trim()) {
        alert(`Por favor completa el campo ${field === 'firstName' ? 'Nombre' : 
               field === 'lastName' ? 'Apellido' : 
               field === 'streetAddress' ? 'Dirección' : 
               field === 'city' ? 'Ciudad' : 
               field === 'phone' ? 'Teléfono' : 'Email'}`);
        return false;
      }
    }

    if (!agreeToTerms) {
      alert('Debes aceptar los términos y condiciones');
      return false;
    }

    if (metodoPago === 'transferencia' && !comprobanteTransferencia) {
      alert('Debes subir el comprobante de transferencia');
      return false;
    }

    return true;
  };

  // Procesar orden
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setProcessingStatus('Procesando orden...');

    try {
      // Preparar datos de la orden
      const orderData = {
        productos: productos.map(producto => ({
          id: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          cantidad: producto.cantidad,
          color: producto.color,
          stockId: producto.stockId
        })),
        cliente: {
          nombre: `${formData.firstName} ${formData.lastName}`,
          direccion: `${formData.streetAddress} ${formData.apartment}`,
          ciudad: formData.city,
          departamento: formData.state,
          codigoPostal: formData.postcode,
          nit: formData.nit,
          telefono: formData.phone,
          email: formData.email,
          nombreQuienRecibe: formData.nombreQuienRecibe || `${formData.firstName} ${formData.lastName}`
        },
        metodoPago: metodoPago,
        metodoEnvio: selectedShipping,
        costoEnvio: costoEnvio,
        subtotal: subtotal,
        total: total,
        notas: formData.orderNotes,
        comprobanteTransferencia: comprobanteTransferencia
      };

      // Mostrar checkout de WhatsApp
      setShowWhatsAppCheckout(true);
      setProcessingStatus('');

    } catch (error) {
      console.error('Error procesando orden:', error);
      setProcessingStatus('Error al procesar la orden');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingProducts) {
    return (
      <div className="checkout-loading">
        <div className="loading-spinner"></div>
        <p>Cargando productos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="checkout-error">
        <h2>Error</h2>
        <p>{error}</p>
        <Link href="/catalog" className="btn-primary">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  if (productos.length === 0) {
    return (
      <div className="checkout-empty">
        <h2>No hay productos para procesar</h2>
        <Link href="/catalog" className="btn-primary">
          Ir al catálogo
        </Link>
      </div>
    );
  }

  return (
    <>
      <Header />
      
      <main className="checkout-container">
        <div className="checkout-content">
          <div className="checkout-form-section">
            <h1>Finalizar Compra</h1>
            
            <form onSubmit={handleSubmit} className="checkout-form">
              {/* Información de contacto */}
              <div className="form-section">
                <h3>Información de Contacto</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">Nombre *</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName">Apellido *</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Teléfono *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="nit">NIT (opcional)</label>
                  <input
                    type="text"
                    id="nit"
                    name="nit"
                    value={formData.nit}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Dirección de envío */}
              <div className="form-section">
                <h3>Dirección de Envío</h3>
                <div className="form-group">
                  <label htmlFor="streetAddress">Dirección *</label>
                  <input
                    type="text"
                    id="streetAddress"
                    name="streetAddress"
                    value={formData.streetAddress}
                    onChange={handleInputChange}
                    placeholder="Calle, número, zona"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="apartment">Apartamento, suite, etc. (opcional)</label>
                  <input
                    type="text"
                    id="apartment"
                    name="apartment"
                    value={formData.apartment}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city">Ciudad *</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="state">Departamento</label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="postcode">Código Postal</label>
                  <input
                    type="text"
                    id="postcode"
                    name="postcode"
                    value={formData.postcode}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="nombreQuienRecibe">Nombre de quien recibe (opcional)</label>
                  <input
                    type="text"
                    id="nombreQuienRecibe"
                    name="nombreQuienRecibe"
                    value={formData.nombreQuienRecibe}
                    onChange={handleInputChange}
                    placeholder="Si es diferente al comprador"
                  />
                </div>
              </div>

              {/* Método de envío */}
              <div className="form-section">
                <h3>Método de Envío</h3>
                <div className="shipping-options">
                  <label className="shipping-option">
                    <input
                      type="radio"
                      name="shipping"
                      value="free_shipping"
                      checked={selectedShipping === 'free_shipping'}
                      onChange={() => handleShippingChange('free_shipping')}
                    />
                    <span className="option-content">
                      <span className="option-title">Envío Gratis</span>
                      <span className="option-description">5-7 días hábiles</span>
                    </span>
                    <span className="option-price">Q0.00</span>
                  </label>
                  <label className="shipping-option">
                    <input
                      type="radio"
                      name="shipping"
                      value="standard_shipping"
                      checked={selectedShipping === 'standard_shipping'}
                      onChange={() => handleShippingChange('standard_shipping')}
                    />
                    <span className="option-content">
                      <span className="option-title">Envío Estándar</span>
                      <span className="option-description">3-5 días hábiles</span>
                    </span>
                    <span className="option-price">Q25.00</span>
                  </label>
                  <label className="shipping-option">
                    <input
                      type="radio"
                      name="shipping"
                      value="express_shipping"
                      checked={selectedShipping === 'express_shipping'}
                      onChange={() => handleShippingChange('express_shipping')}
                    />
                    <span className="option-content">
                      <span className="option-title">Envío Express</span>
                      <span className="option-description">1-2 días hábiles</span>
                    </span>
                    <span className="option-price">Q50.00</span>
                  </label>
                </div>
              </div>

              {/* Método de pago */}
              <div className="form-section">
                <h3>Método de Pago</h3>
                <div className="payment-options">
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="payment"
                      value="contra_entrega"
                      checked={metodoPago === 'contra_entrega'}
                      onChange={() => handlePaymentMethodChange('contra_entrega')}
                    />
                    <span className="option-content">
                      <span className="option-title">Contra Entrega</span>
                      <span className="option-description">Paga cuando recibas tu pedido</span>
                    </span>
                  </label>
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="payment"
                      value="transferencia"
                      checked={metodoPago === 'transferencia'}
                      onChange={() => handlePaymentMethodChange('transferencia')}
                    />
                    <span className="option-content">
                      <span className="option-title">Transferencia Bancaria</span>
                      <span className="option-description">Paga por transferencia y sube tu comprobante</span>
                    </span>
                  </label>
                </div>

                {metodoPago === 'transferencia' && (
                  <div className="transfer-info">
                    <h4>Información de Transferencia</h4>
                    <p><strong>Banco:</strong> Banco Industrial</p>
                    <p><strong>Cuenta:</strong> 123-456789-0</p>
                    <p><strong>Titular:</strong> La Mega Tienda GT</p>
                    <p><strong>Tipo:</strong> Cuenta Corriente</p>
                    
                    <div className="form-group">
                      <label htmlFor="comprobante">Comprobante de Transferencia *</label>
                      <input
                        type="file"
                        id="comprobante"
                        accept="image/*"
                        onChange={handleFileChange}
                        required={metodoPago === 'transferencia'}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Notas adicionales */}
              <div className="form-section">
                <h3>Notas Adicionales</h3>
                <div className="form-group">
                  <textarea
                    name="orderNotes"
                    value={formData.orderNotes}
                    onChange={handleInputChange}
                    placeholder="Instrucciones especiales, comentarios, etc."
                    rows="3"
                  />
                </div>
              </div>

              {/* Términos y condiciones */}
              <div className="form-section">
                <label className="terms-checkbox">
                  <input
                    type="checkbox"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    required
                  />
                  <span>Acepto los <Link href="/terms" target="_blank">términos y condiciones</Link> y la <Link href="/privacy" target="_blank">política de privacidad</Link></span>
                </label>
              </div>

              {/* Botón de envío */}
              <button
                type="submit"
                className="btn-submit"
                disabled={isLoading}
              >
                {isLoading ? 'Procesando...' : 'Finalizar Compra'}
              </button>
            </form>
          </div>

          {/* Resumen de la orden */}
          <div className="checkout-summary">
            <h3>Resumen de la Orden</h3>
            
            <div className="order-items">
              {productos.map((producto, index) => (
                <div key={index} className="order-item">
                  <div className="item-image">
                    <Image
                      src={producto.url_imagen}
                      alt={producto.nombre}
                      width={60}
                      height={60}
                      className="product-image"
                    />
                  </div>
                  <div className="item-details">
                    <h4>{producto.nombre}</h4>
                    <p className="item-color">Color: {producto.color.nombre}</p>
                    <p className="item-quantity">Cantidad: {producto.cantidad}</p>
                    <p className="item-price">Q{producto.precio.toFixed(2)}</p>
                  </div>
                  <div className="item-total">
                    Q{(producto.precio * producto.cantidad).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="order-totals">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>Q{subtotal.toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Envío:</span>
                <span>Q{costoEnvio.toFixed(2)}</span>
              </div>
              <div className="total-row total-final">
                <span>Total:</span>
                <span>Q{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de WhatsApp Checkout */}
      {showWhatsAppCheckout && (
        <WhatsAppCheckout
          orderData={{
            productos: productos,
            cliente: {
              nombre: `${formData.firstName} ${formData.lastName}`,
              direccion: `${formData.streetAddress} ${formData.apartment}`,
              ciudad: formData.city,
              departamento: formData.state,
              codigoPostal: formData.postcode,
              nit: formData.nit,
              telefono: formData.phone,
              email: formData.email,
              nombreQuienRecibe: formData.nombreQuienRecibe || `${formData.firstName} ${formData.lastName}`
            },
            metodoPago: metodoPago,
            metodoEnvio: selectedShipping,
            costoEnvio: costoEnvio,
            subtotal: subtotal,
            total: total,
            notas: formData.orderNotes,
            comprobanteTransferencia: comprobanteTransferencia
          }}
          onClose={() => setShowWhatsAppCheckout(false)}
        />
      )}

      <Footer />
    </>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <CheckoutPageContent />
    </Suspense>
  );
}
