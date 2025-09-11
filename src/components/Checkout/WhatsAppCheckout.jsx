'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import '@/styles/WhatsAppCheckout.css';

const WhatsAppCheckout = ({ 
  orderData, 
  customerData, 
  cartItems, 
  totalAmount,
  onBack,
  onSuccess 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const formatPrice = (price) => {
    return `Q${price.toFixed(2)}`;
  };

  const formatOrderNumber = () => {
    const timestamp = Date.now();
    return `ORD-${timestamp}`;
  };

  const generateWhatsAppMessage = () => {
    const orderNumber = formatOrderNumber();
    const itemsList = cartItems.map(item => 
      `• ${item.producto?.nombre || 'Producto'} - ${item.color?.nombre || 'Sin color'} - Q${item.precio.toFixed(2)} x ${item.cantidad}`
    ).join('\n');

    const message = `🛒 *NUEVA ORDEN - ${orderNumber}*

👤 *DATOS DEL CLIENTE:*
• Nombre: ${customerData.nombre}
• Email: ${customerData.email}
• Teléfono: ${customerData.telefono}
• Dirección: ${customerData.direccion}
${orderData?.nit_cliente ? `• NIT: ${orderData.nit_cliente}` : ''}

📦 *PRODUCTOS:*
${itemsList}

💰 *TOTAL: Q${totalAmount.toFixed(2)}*

💳 *MÉTODO DE PAGO:* Transferencia Bancaria

📋 *INSTRUCCIONES:*
1. El cliente desea pagar por transferencia
2. Necesita los datos bancarios para realizar el pago
3. Por favor, proporciona los datos de cuenta y confirma la orden

🆔 *ID de Orden:* ${orderNumber}

---
*Orden generada desde La Mega Tienda GT*`;

    return encodeURIComponent(message);
  };

  const generateWhatsAppMessageWithOrderNumber = (realOrderNumber) => {
    const itemsList = cartItems.map(item => 
      `• ${item.producto?.nombre || 'Producto'} - ${item.color?.nombre || 'Sin color'} - Q${item.precio.toFixed(2)} x ${item.cantidad}`
    ).join('\n');

    const message = `🛒 *NUEVA ORDEN - ${realOrderNumber}*

👤 *DATOS DEL CLIENTE:*
• Nombre: ${customerData.nombre}
• Email: ${customerData.email}
• Teléfono: ${customerData.telefono}
• Dirección: ${customerData.direccion}
${orderData?.nit_cliente ? `• NIT: ${orderData.nit_cliente}` : ''}

📦 *PRODUCTOS:*
${itemsList}

💰 *TOTAL: Q${totalAmount.toFixed(2)}*

💳 *MÉTODO DE PAGO:* Transferencia Bancaria

📋 *INSTRUCCIONES:*
1. El cliente desea pagar por transferencia
2. Necesita los datos bancarios para realizar el pago
3. Por favor, proporciona los datos de cuenta y confirma la orden

🆔 *ID de Orden:* ${realOrderNumber}

---
*Orden generada desde La Mega Tienda GT*`;

    return encodeURIComponent(message);
  };

  const handleWhatsAppCheckout = async () => {
    setIsLoading(true);
    
    try {
      console.log('🔄 Iniciando WhatsApp checkout...');
      console.log('📦 customerData:', customerData);
      console.log('📦 cartItems:', cartItems);
      console.log('📦 orderData:', orderData);
      
      // Crear la orden en la base de datos primero
      const orderDataToSend = {
        // Datos del cliente
        nombre_cliente: customerData.nombre,
        email_cliente: customerData.email,
        telefono_cliente: customerData.telefono,
        direccion_cliente: customerData.direccion,
        municipio_cliente: orderData?.municipio_cliente || '',
        departamento_cliente: orderData?.departamento_cliente || '',
        codigo_postal_cliente: orderData?.codigo_postal_cliente || '',
        nit_cliente: orderData?.nit_cliente || '',
        nombre_quien_recibe: orderData?.nombre_quien_recibe || customerData.nombre,
        
        // Datos de la orden
        productos: cartItems.map(item => ({
          producto_id: item.producto?.id || item.id,
          color_id: item.color?.id,
          cantidad: item.cantidad,
          precio: item.precio,
          nombre: item.producto?.nombre || 'Producto',
          color: item.color
        })),
        subtotal: totalAmount,
        costo_envio: 0,
        total: totalAmount,
        metodo_pago: 'transferencia', // Método correcto
        estado: 'pendiente',
        notas: 'Orden creada por WhatsApp',
        
        // Usuario (si está autenticado)
        usuario_id: orderData?.usuario_id || null
      };

      console.log('📤 Datos a enviar:', JSON.stringify(orderDataToSend, null, 2));

      // Crear la orden en la base de datos
      const response = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderDataToSend)
      });

      console.log('📡 Respuesta del servidor:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`Error al crear la orden en la base de datos: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Resultado exitoso:', result);
      
      // Número de WhatsApp de la empresa
      const whatsappNumber = '+50254844058';
      
      // Generar mensaje con el número real de la orden
      const message = generateWhatsAppMessageWithOrderNumber(result.orden.codigo_orden);
      
      // Crear URL de WhatsApp
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
      
      // Abrir WhatsApp en nueva ventana
      window.open(whatsappUrl, '_blank');
      
      // Limpiar el carrito
      clearCart();
      
      // Disparar evento de nueva orden creada para notificaciones en tiempo real
      window.dispatchEvent(new CustomEvent('newOrderCreated', {
        detail: {
          orderNumber: result.orden.codigo_orden,
          orderId: result.orden.id,
          method: 'transferencia'
        }
      }));
      
      // Disparar evento de éxito
      if (onSuccess) {
        onSuccess({
          orderNumber: result.orden.codigo_orden,
          method: 'transferencia',
          status: 'pending'
        });
      }
      
      setIsSuccess(true);
      
    } catch (error) {
      console.error('Error en WhatsApp checkout:', error);
      alert('Error al procesar la orden. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para limpiar el carrito
  const clearCart = async () => {
    try {
      console.log('🧹 Iniciando limpieza del carrito...');
      
      // Verificar si el usuario está autenticado
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      
      if (token) {
        console.log('👤 Usuario autenticado, limpiando carrito en backend...');
        
        // Usuario autenticado - limpiar carrito en el backend
        const response = await fetch('/api/cart/clear', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          console.log('✅ Carrito limpiado exitosamente en el backend');
        } else {
          console.error('❌ Error al limpiar el carrito en el backend:', response.status);
        }
      } else {
        console.log('👤 Usuario no autenticado, limpiando solo localStorage...');
      }
      
      // Limpiar localStorage siempre (para guest checkout también)
      if (typeof window !== 'undefined') {
        const keysToRemove = [
          'cart',
          'cartItems', 
          'guestCart',
          'cartCount',
          'recentSearches'
        ];
        
        keysToRemove.forEach(key => {
          localStorage.removeItem(key);
          console.log(`🗑️ Removido de localStorage: ${key}`);
        });
      }
      
      // Disparar eventos para actualizar otros componentes
      window.dispatchEvent(new CustomEvent('cartUpdated', {
        detail: { cartCount: 0 }
      }));
      
      window.dispatchEvent(new CustomEvent('cartCleared'));
      
      console.log('✅ Carrito limpiado completamente');
    } catch (error) {
      console.error('❌ Error al limpiar el carrito:', error);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  if (isSuccess) {
    return (
      <div className="whatsapp-checkout-success">
        <div className="success-icon">✅</div>
        <h2>¡Orden Enviada Exitosamente!</h2>
        <p>Tu orden ha sido enviada por WhatsApp. Un representante se pondrá en contacto contigo pronto.</p>
        
        <div className="order-details">
          <h3>Detalles de la Orden:</h3>
          <p><strong>Número de Orden:</strong> {formatOrderNumber()}</p>
          <p><strong>Total:</strong> {formatPrice(totalAmount)}</p>
          <p><strong>Método:</strong> Transferencia Bancaria</p>
        </div>
        
        <div className="next-steps">
          <h3>Próximos Pasos:</h3>
          <ol>
            <li>Un representante te contactará por WhatsApp</li>
            <li>Te proporcionará los datos bancarios</li>
            <li>Realiza la transferencia</li>
            <li>Envía el comprobante por WhatsApp</li>
            <li>Tu pedido será procesado</li>
          </ol>
        </div>
        
        <div className="cart-cleared-notice">
          <div className="notice-icon">🛒</div>
          <p><strong>Tu carrito ha sido limpiado automáticamente</strong></p>
          <p>Los productos de esta orden ya no están en tu carrito</p>
        </div>
        
        <div className="success-actions">
          <button 
            className="btn-primary"
            onClick={() => window.location.href = '/'}
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="whatsapp-checkout">
      <div className="whatsapp-header">
        <div className="whatsapp-icon">
          <Image
            src="/assets/whatsapp-icon.svg"
            alt="WhatsApp"
            width={48}
            height={48}
            priority
          />
        </div>
        <h2>Finalizar Compra por WhatsApp</h2>
        <p>Enviaremos tu orden directamente a nuestro equipo de ventas</p>
      </div>

      <div className="order-summary">
        <h3>Resumen de la Orden</h3>
        
        <div className="customer-info">
          <h4>Datos del Cliente:</h4>
          <p><strong>Nombre:</strong> {customerData.nombre}</p>
          <p><strong>Email:</strong> {customerData.email}</p>
          <p><strong>Teléfono:</strong> {customerData.telefono}</p>
          <p><strong>Dirección:</strong> {customerData.direccion}</p>
        </div>

        <div className="items-summary">
          <h4>Productos ({cartItems.length}):</h4>
          <div className="items-list">
            {cartItems.map((item, index) => (
              <div key={index} className="item-summary">
                <div className="item-info">
                  <span className="item-name">{item.producto?.nombre}</span>
                  <span className="item-details">
                    {item.color?.nombre} • Q{item.precio.toFixed(2)} x {item.cantidad}
                  </span>
                </div>
                <span className="item-total">Q{(item.precio * item.cantidad).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="total-summary">
          <div className="total-row">
            <span>Total:</span>
            <span className="total-amount">{formatPrice(totalAmount)}</span>
          </div>
        </div>
      </div>

      <div className="whatsapp-benefits">
        <h3>¿Por qué WhatsApp?</h3>
        <ul>
          <li>✅ Atención personalizada inmediata</li>
          <li>✅ Datos bancarios seguros</li>
          <li>✅ Confirmación rápida de la orden</li>
          <li>✅ Soporte durante todo el proceso</li>
          <li>✅ Seguimiento en tiempo real</li>
        </ul>
      </div>

      <div className="whatsapp-actions">
        <button 
          className="btn-secondary"
          onClick={handleBack}
          disabled={isLoading}
        >
          ← Volver
        </button>
        
        <button 
          className="btn-whatsapp"
          onClick={handleWhatsAppCheckout}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="loading-spinner"></div>
              Enviando...
            </>
          ) : (
            <>
              <Image
                src="/assets/whatsapp-icon.svg"
                alt="WhatsApp"
                width={20}
                height={20}
                priority
              />
              Finalizar por WhatsApp
            </>
          )}
        </button>
      </div>

      <div className="whatsapp-note">
        <p>
          <strong>Nota:</strong> Al hacer clic en "Finalizar por WhatsApp", se abrirá 
          WhatsApp con un mensaje pre-llenado con los detalles de tu orden. 
          Un representante te contactará para completar el proceso de pago.
        </p>
      </div>
    </div>
  );
};

export default WhatsAppCheckout;
