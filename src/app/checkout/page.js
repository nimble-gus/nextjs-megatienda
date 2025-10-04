'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppCheckout from '@/components/Checkout/WhatsAppCheckout';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/useAuth';

import '@/styles/CheckoutPage.css';
import '@/styles/BillingDetails.css';
import '@/styles/OrderSummary.css';

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cartItems, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  
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
  const [costoEnvio, setCostoEnvio] = useState(0); // Envío gratis por defecto
  const [selectedShipping, setSelectedShipping] = useState('free_shipping');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('contra_entrega');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  // Estados de UI
  const [isLoading, setIsLoading] = useState(false);

  const [queuePosition, setQueuePosition] = useState(null);
  const [processingStatus, setProcessingStatus] = useState('');
  const [showWhatsAppCheckout, setShowWhatsAppCheckout] = useState(false);


  // Cargar productos al montar el componente
  useEffect(() => {
    const productoId = searchParams.get('producto');
    const colorId = searchParams.get('color');
    const cantidad = searchParams.get('cantidad');
    const fromCart = searchParams.get('fromCart');

    if (fromCart === 'true') {
      // Cargar productos desde el carrito
      cargarProductosDelCarrito();
    } else if (productoId && colorId && cantidad) {
      // Cargar producto específico (compra rápida)
      cargarProductoEspecifico(productoId, colorId, parseInt(cantidad));
    } else {
      // Redirigir al catálogo si no hay productos
      router.push('/catalog');
    }
  }, [searchParams]);

  // Cargar productos desde el carrito
  const cargarProductosDelCarrito = async () => {
    try {
      setIsLoadingProducts(true);
      setError('');
      
      if (cartItems && cartItems.length > 0) {
        // Transformar los items del carrito al formato esperado por el checkout
        const productosTransformados = cartItems.map(item => ({
          id: item.producto.id,
          nombre: item.producto.nombre,
          url_imagen: item.producto.url_imagen,
          cantidad: item.cantidad,
          precio: item.precio,
          color: {
            id: item.color_id, // Usar color_id del carrito, no el id del objeto color
            nombre: item.color.nombre,
            hex: item.color.codigo_hex
          },
          stockId: item.id // Este es el ID del item del carrito, no del stock_detalle
        }));
        
        setProductos(productosTransformados);
      } else {
        setError('Tu carrito está vacío');
      }
    } catch (error) {
      console.error('Error cargando carrito:', error);
      setError('Error cargando productos del carrito');
    } finally {
      setIsLoadingProducts(false);
    }
  };

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
        setError('Error cargando el producto');
      }
    } catch (error) {
      console.error('Error cargando producto:', error);
      setError('Error cargando el producto');
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

  // Manejar cambio de opción de envío
  const handleShippingChange = (option) => {
    setSelectedShipping(option);
    switch (option) {
      case 'local_pickup':
        setCostoEnvio(0);
        break;
      case 'free_shipping':
        setCostoEnvio(0);
        break;
      default:
        setCostoEnvio(0);
    }
  };

  // Manejar cambio de método de pago
  const handlePaymentMethodChange = (method) => {
    setSelectedPaymentMethod(method);
  };




  // Calcular totales
  const subtotal = productos.reduce((total, producto) => {
    return total + (producto.precio * producto.cantidad);
  }, 0);

  const total = subtotal + costoEnvio;

  // Validar NIT
  const validateNIT = (nit) => {
    const nitValue = nit.trim().toUpperCase();
    
    // Si el total es menor o igual a Q2499, permitir CF, C/F, Cliente final
    if (total <= 2499) {
      const allowedCFValues = ['CF', 'C/F', 'CLIENTE FINAL', 'CLIENTE FINAL.'];
      if (allowedCFValues.includes(nitValue)) {
        return true;
      }
    }
    
    // Para montos mayores a Q2499, NIT es obligatorio y no puede ser CF
    if (total >= 2500) {
      if (!nitValue || nitValue === '' || ['CF', 'C/F', 'CLIENTE FINAL', 'CLIENTE FINAL.'].includes(nitValue)) {
        return false;
      }
    }
    
    // Validar formato de NIT (debe tener al menos 4 caracteres y ser alfanumérico)
    if (nitValue && nitValue.length < 4) {
      return false;
    }
    
    // Validar que el NIT tenga un formato válido (números y letras, sin caracteres especiales excepto guiones)
    if (nitValue && !/^[A-Z0-9-]+$/.test(nitValue)) {
      return false;
    }
    
    return true;
  };

  // Obtener mensaje de error para NIT
  const getNITErrorMessage = () => {
    if (total >= 2500) {
      return 'Para compras mayores a Q2,500 es obligatorio proporcionar un NIT válido';
    } else {
      return 'Puede usar "CF" para Cliente Final o proporcionar un NIT válido';
    }
  };

  // Validar formulario
  const isFormValid = () => {
    const requiredFields = ['firstName', 'lastName', 'streetAddress', 'city', 'state', 'postcode', 'phone', 'email'];
    const hasRequiredFields = requiredFields.every(field => formData[field].trim() !== '');
    
    // Validar NIT
    const isNITValid = validateNIT(formData.nit);
    
    return hasRequiredFields && isNITValid && agreeToTerms;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      // Verificar específicamente el NIT
      if (formData.nit && !validateNIT(formData.nit)) {
        alert(getNITErrorMessage());
        return;
      }
      
      alert('Por favor completa todos los campos requeridos y acepta los términos');
      return;
    }

    setIsLoading(true);

    try {
      // Obtener usuario actual del contexto de autenticación
      const userId = user ? user.id : null;
      
      console.log('🔍 [Checkout] Debug usuario:');
      console.log('  - isAuthenticated:', isAuthenticated);
      console.log('  - user:', user);
      console.log('  - userId:', userId);
      
      const orderData = {
        // Datos del usuario (si está logueado)
        usuario_id: userId,
        
        // Datos del cliente
        nombre_cliente: `${formData.firstName} ${formData.lastName}`,
        email_cliente: formData.email,
        telefono_cliente: formData.phone,
        direccion_cliente: `${formData.streetAddress}${formData.apartment ? `, ${formData.apartment}` : ''}`,
        municipio_cliente: formData.city,
        departamento_cliente: formData.state,
        codigo_postal_cliente: formData.postcode,
        nit_cliente: formData.nit,
        nombre_quien_recibe: formData.nombreQuienRecibe,
        
        // Datos de la orden
        productos: productos,
        subtotal: subtotal,
        costo_envio: costoEnvio,
        total: total,
        metodo_pago: selectedPaymentMethod,
        estado: 'pendiente',
        notas: formData.orderNotes
      };

      // Preparar los datos para enviar
      console.log('📦 [Checkout] OrderData a enviar:', orderData);
      const requestData = JSON.stringify(orderData);
      const headers = {
        'Content-Type': 'application/json'
      };

      // Llamada a la API para crear la orden
      const response = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers,
        body: requestData
      });

      if (response.status === 429) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Demasiadas peticiones. Intenta de nuevo en unos minutos.');
      }

      const result = await response.json();

      if (response.ok) {
        // Orden creada exitosamente
        console.log('✅ [Checkout] Orden creada exitosamente, limpiando carrito...');
        
        // Enviar email de confirmación
        try {
          const emailData = {
            orderId: result.orden.codigo_orden,
            customerEmail: formData.email,
            customerName: `${formData.firstName} ${formData.lastName}`,
            items: productos.map(producto => ({
              name: producto.nombre,
              sku: producto.sku,
              quantity: producto.cantidad,
              price: producto.precio
            })),
            total: total,
            shippingAddress: `${formData.streetAddress}${formData.apartment ? `, ${formData.apartment}` : ''}, ${formData.city}, ${formData.state} ${formData.postcode}`,
            paymentMethod: selectedPaymentMethod === 'contra_entrega' ? 'Contra Entrega' : 
                          selectedPaymentMethod === 'transferencia' ? 'Transferencia Bancaria' : 
                          selectedPaymentMethod
          };

          const emailResponse = await fetch('/api/email/send-order-confirmation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(emailData)
          });

          if (emailResponse.ok) {
            console.log('✅ [Checkout] Email de confirmación enviado');
          } else {
            console.warn('⚠️ [Checkout] Error enviando email de confirmación');
          }
        } catch (emailError) {
          console.warn('⚠️ [Checkout] Error enviando email:', emailError);
          // No bloquear el flujo si falla el email
        }

        
        // Limpiar el carrito después de una orden exitosa
        await clearCart();
        console.log('✅ [Checkout] Carrito limpiado');
        
        // Disparar evento para actualizar el contador del carrito en el header
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        
        // Disparar evento para forzar recarga del carrito en todos los componentes
        window.dispatchEvent(new CustomEvent('cartCleared'));
        
        // Disparar evento de nueva orden creada para notificaciones en tiempo real
        window.dispatchEvent(new CustomEvent('newOrderCreated', {
          detail: {
            orderNumber: result.orden.codigo_orden,
            orderId: result.orden.id,
            method: result.orden.metodo_pago
          }
        }));
        
        // Redirigir a la página de confirmación
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
            <div className="empty-title">
              Producto no disponible
            </div>
            <div className="empty-message">
              No se pudo cargar el producto seleccionado
            </div>
            <Link href="/catalog" className="empty-action">
              Continuar comprando
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar WhatsApp Checkout si está activado
  if (showWhatsAppCheckout) {
    const customerData = {
      nombre: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      telefono: formData.phone,
      direccion: `${formData.streetAddress} ${formData.apartment}, ${formData.city}, ${formData.state} ${formData.postcode}`
    };

    const totalAmount = productos.reduce((total, producto) => {
      const precio = producto.precio || producto.producto?.precio || 0;
      const cantidad = producto.cantidad || 1;
      return total + (precio * cantidad);
    }, 0) + costoEnvio;

    return (
      <div className="checkout-page">
        <div className="sticky-wrapper">
          <Header />
        </div>
        <div className="checkout-main">
          <div className="checkout-container">
            <WhatsAppCheckout
              orderData={{
                productos,
                costoEnvio,
                metodoPago: selectedPaymentMethod,
                notas: formData.orderNotes,
                nit_cliente: formData.nit,
                municipio_cliente: formData.city,
                departamento_cliente: formData.state,
                codigo_postal_cliente: formData.postcode,
                nombre_quien_recibe: formData.nombreQuienRecibe,
                usuario_id: null
              }}
              customerData={customerData}
              cartItems={productos}
              totalAmount={totalAmount}
              onBack={() => setShowWhatsAppCheckout(false)}
              onSuccess={(orderResult) => {
        
                // Aquí puedes manejar el éxito de la orden
              }}
            />
          </div>
        </div>
        <Footer />
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
            <h1>{searchParams.get('fromCart') === 'true' ? 'Finalizar Compra' : 'Compra Rápida'}</h1>
            <div className="breadcrumb">
              <span>Inicio</span>
              <span>•</span>
              <span>{searchParams.get('fromCart') === 'true' ? 'Carrito' : 'Producto'}</span>
              <span>•</span>
              <span>{searchParams.get('fromCart') === 'true' ? 'Checkout' : 'Compra Rápida'}</span>
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

                    <div className="form-group full-width">
                      <label className="form-label required">Nombre de Quien Recibe</label>
                      <input
                        type="text"
                        name="nombreQuienRecibe"
                        value={formData.nombreQuienRecibe}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Nombre completo de la persona que recibirá el pedido"
                        required
                      />
                    </div>

                    <div className="form-row">
                                             <div className="form-group">
                         <label className="form-label required">Municipio</label>
                         <input
                           type="text"
                           name="city"
                           value={formData.city}
                           onChange={handleInputChange}
                           className="form-input"
                           placeholder="Municipio"
                           required
                         />
                       </div>
                                             <div className="form-group">
                         <label className="form-label required">Departamento</label>
                         <input
                           type="text"
                           name="state"
                           value={formData.state}
                           onChange={handleInputChange}
                           className="form-input"
                           placeholder="Departamento"
                           required
                         />
                       </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label required">Zona</label>
                        <input
                          type="text"
                          name="postcode"
                          value={formData.postcode}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="Zona"
                          required
                        />
                      </div>
                                             <div className="form-group">
                         <label className={`form-label ${total >= 2500 ? 'required' : ''}`}>
                           NIT {total >= 2500 ? '(Obligatorio)' : '(Opcional)'}
                         </label>
                         <input
                           type="text"
                           name="nit"
                           value={formData.nit}
                           onChange={handleInputChange}
                           className={`form-input ${formData.nit && !validateNIT(formData.nit) ? 'form-input-error' : ''}`}
                           placeholder={total >= 2500 ? 'NIT obligatorio para facturación' : 'CF para Cliente Final o NIT de la empresa'}
                         />
                         {formData.nit && !validateNIT(formData.nit) && (
                           <div className="form-error-message">
                             {getNITErrorMessage()}
                           </div>
                         )}
                         {total >= 2500 && (
                           <div className="form-help-text">
                             💡 Para compras mayores a Q2,500 se requiere NIT para facturación
                           </div>
                         )}
                         {total <= 2499 && (
                           <div className="form-help-text">
                             💡 Puede usar &quot;CF&quot; para Cliente Final o proporcionar un NIT
                           </div>
                         )}
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

                    {/* Sección de Opciones de Envío */}
                    <div className="checkout-shipping-section">
                      <div className="checkout-shipping-title">
                        Opciones de Envío
                      </div>
                      <div className="checkout-shipping-options">
                        <div 
                          className={`checkout-shipping-option ${selectedShipping === 'local_pickup' ? 'selected' : ''}`}
                          onClick={() => handleShippingChange('local_pickup')}
                        >
                          <input
                            type="radio"
                            name="shipping"
                            value="local_pickup"
                            checked={selectedShipping === 'local_pickup'}
                            onChange={() => handleShippingChange('local_pickup')}
                            className="checkout-shipping-radio"
                          />
                          <div className="checkout-shipping-content">
                            <div className="checkout-shipping-label">Recoger en bodega</div>
                            <div className="checkout-shipping-description">Retira tu pedido en nuestras instalaciones</div>
                          </div>
                          <div className="checkout-shipping-price">Q0.00</div>
                        </div>
                        
                        <div 
                          className={`checkout-shipping-option ${selectedShipping === 'free_shipping' ? 'selected' : ''}`}
                          onClick={() => handleShippingChange('free_shipping')}
                        >
                          <input
                            type="radio"
                            name="shipping"
                            value="free_shipping"
                            checked={selectedShipping === 'free_shipping'}
                            onChange={() => handleShippingChange('free_shipping')}
                            className="checkout-shipping-radio"
                          />
                          <div className="checkout-shipping-content">
                            <div className="checkout-shipping-label">Envío gratis</div>
                            <div className="checkout-shipping-description">Entrega a domicilio sin costo adicional</div>
                          </div>
                          <div className="checkout-shipping-price">Q0.00</div>
                        </div>
                      </div>
                    </div>

                    {/* Sección de Métodos de Pago */}
                    <div className="checkout-payment-section">
                      <div className="checkout-payment-title">
                        Método de Pago
                      </div>
                      <div className="checkout-payment-methods">
                        <div 
                          className={`checkout-payment-method ${selectedPaymentMethod === 'contra_entrega' ? 'selected' : ''}`}
                          onClick={() => handlePaymentMethodChange('contra_entrega')}
                        >
                          <input
                            type="radio"
                            name="payment"
                            value="contra_entrega"
                            checked={selectedPaymentMethod === 'contra_entrega'}
                            onChange={() => handlePaymentMethodChange('contra_entrega')}
                            className="checkout-payment-radio"
                          />
                          <div className="checkout-payment-content">
                            <div className="checkout-payment-label">Pago contra entrega</div>
                            <div className="checkout-payment-description">Paga cuando recibas tu pedido en efectivo</div>
                          </div>
                        </div>
                        
                        <div 
                          className={`checkout-payment-method ${selectedPaymentMethod === 'transferencia' ? 'selected' : ''}`}
                          onClick={() => handlePaymentMethodChange('transferencia')}
                        >
                          <input
                            type="radio"
                            name="payment"
                            value="transferencia"
                            checked={selectedPaymentMethod === 'transferencia'}
                            onChange={() => handlePaymentMethodChange('transferencia')}
                            className="checkout-payment-radio"
                          />
                          <div className="checkout-payment-content">
                            <div className="checkout-payment-label">Pago con transferencia</div>
                            <div className="checkout-payment-description">Transferencia bancaria - Continúa por WhatsApp</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* WhatsApp Checkout para transferencias */}
                    {selectedPaymentMethod === 'transferencia' && (
                      <div className="form-group full-width">
                        <div className="whatsapp-transfer-notice">
                          <div className="notice-icon">💬</div>
                          <div className="notice-content">
                            <h4>Finalizar por WhatsApp</h4>
                            <p>Para proteger tu seguridad, los datos bancarios se proporcionan por WhatsApp. Haz clic en el botón para continuar.</p>
                            <button 
                              type="button" 
                              className="btn-whatsapp-transfer"
                              onClick={() => {
                                console.log('Botón WhatsApp clickeado');
                                setShowWhatsAppCheckout(true);
                              }}
                            >
                              📱 Finalizar por WhatsApp
                            </button>
                          </div>
                        </div>
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

                                         {/* Checkbox de términos y condiciones */}
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

                     {/* Botón de completar compra */}
                     <button
                       type="submit"
                       onClick={handleSubmit}
                       disabled={!isFormValid() || isLoading}
                       className="place-order-btn"
                     >
                       {isLoading 
                         ? 'Procesando...' 
                         : 'Completar Compra'
                       }
                     </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Columna derecha - Resumen de la orden */}
            <div className="order-summary-section">
              <div className="checkout-card order-summary">
                <div className="card-header">
                  <h2>Resumen de Compra</h2>
                  <div className="guest-summary-notice">
                    Compra directa sin cuenta
                  </div>
                </div>
                <div className="card-body">
                  
                  {/* Lista de productos */}
                  <div className="order-items">
                    {productos.map((producto, index) => (
                      <div key={index} className="order-item">
                        <Image
                          src={producto.url_imagen || producto.producto?.url_imagen || producto.imagenes?.[0]?.url || 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/accessories-bag'}
                          alt={producto.nombre || producto.producto?.nombre || 'Producto'}
                          width={80}
                          height={80}
                          className="item-image"
                          onError={(e) => {
                            e.target.src = 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/accessories-bag';
                          }}
                        />
                        <div className="item-details">
                          <div className="item-name">{producto.nombre || producto.producto?.nombre}</div>
                          <div className="item-meta">
                            Cantidad: {producto.cantidad} | 
                            Color: {producto.color?.nombre || 'N/A'}
                          </div>
                        </div>
                                                 <div className="item-price">
                           Q{(producto.precio * producto.cantidad).toFixed(2)}
                         </div>
                      </div>
                    ))}
                  </div>

                  {/* Totales */}
                  <div className="order-totals">
                                         <div className="total-row">
                       <span>Subtotal</span>
                       <span>Q{subtotal.toFixed(2)}</span>
                     </div>
                     <div className="total-row">
                       <span>Envío</span>
                       <span>Q{costoEnvio.toFixed(2)}</span>
                     </div>
                     <div className="total-row final">
                       <span>Total</span>
                       <span>Q{total.toFixed(2)}</span>
                     </div>
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

// Componente principal que envuelve en Suspense
export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="checkout-page">
        <div className="sticky-wrapper">
          <Header />
        </div>
        <div className="checkout-main">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <div className="loading-text">Cargando checkout...</div>
            <div className="loading-subtext">Preparando tu orden</div>
          </div>
        </div>
      </div>
    }>
      <CheckoutPageContent />
    </Suspense>
  );
}
