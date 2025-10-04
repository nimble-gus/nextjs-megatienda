// email.js - Configuración y utilidades para envío de correos con Resend

import { Resend } from 'resend';

// Inicializar Resend con la API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Configuración de email
const EMAIL_CONFIG = {
  from: process.env.FROM_EMAIL || 'noreply@lamegatiendagt.com',
  fromName: process.env.FROM_NAME || 'LaMegaTiendaGT',
  replyTo: process.env.REPLY_TO_EMAIL || 'soporte@lamegatiendagt.com'
};

/**
 * Envía un correo de confirmación de orden
 * @param {Object} orderData - Datos de la orden
 * @param {string} orderData.orderId - ID de la orden
 * @param {string} orderData.customerEmail - Email del cliente
 * @param {string} orderData.customerName - Nombre del cliente
 * @param {Array} orderData.items - Items de la orden
 * @param {number} orderData.total - Total de la orden
 * @param {string} orderData.shippingAddress - Dirección de envío
 * @param {string} orderData.paymentMethod - Método de pago
 * @returns {Promise<Object>} - Resultado del envío
 */
export async function sendOrderConfirmationEmail(orderData) {
  try {
    const { orderId, customerEmail, customerName, items, total, shippingAddress, paymentMethod } = orderData;

    const emailHtml = generateOrderConfirmationHTML({
      orderId,
      customerName,
      items,
      total,
      shippingAddress,
      paymentMethod
    });

    const result = await resend.emails.send({
      from: `${EMAIL_CONFIG.fromName} <${EMAIL_CONFIG.from}>`,
      to: [customerEmail],
      subject: `Confirmación de Orden #${orderId} - LaMegaTiendaGT`,
      html: emailHtml,
      replyTo: EMAIL_CONFIG.replyTo
    });

    console.log('Email de confirmación enviado:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error enviando email de confirmación:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Genera el HTML para el email de confirmación de orden
 */
function generateOrderConfirmationHTML({ orderId, customerName, items, total, shippingAddress, paymentMethod }) {
  const formatPrice = (price) => `Q${price.toFixed(2)}`;
  
  const itemsHtml = items.map(item => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 16px; text-align: left;">
        <div style="font-weight: 600; color: #1f2937;">${item.name}</div>
        <div style="font-size: 14px; color: #6b7280;">SKU: ${item.sku}</div>
        <div style="font-size: 14px; color: #6b7280;">Cantidad: ${item.quantity}</div>
      </td>
      <td style="padding: 16px; text-align: right; font-weight: 600; color: #1f2937;">
        ${formatPrice(item.price * item.quantity)}
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmación de Orden</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8fafc;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 32px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">¡Orden Confirmada!</h1>
          <p style="color: #e0e7ff; margin: 8px 0 0 0; font-size: 16px;">Gracias por tu compra en LaMegaTiendaGT</p>
        </div>

        <!-- Content -->
        <div style="padding: 32px;">
          <!-- Order Info -->
          <div style="background-color: #f8fafc; padding: 24px; border-radius: 8px; margin-bottom: 24px;">
            <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 20px;">Detalles de la Orden</h2>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #6b7280;">Número de Orden:</span>
              <span style="font-weight: 600; color: #1f2937;">#${orderId}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #6b7280;">Cliente:</span>
              <span style="font-weight: 600; color: #1f2937;">${customerName}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #6b7280;">Método de Pago:</span>
              <span style="font-weight: 600; color: #1f2937;">${paymentMethod}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #6b7280;">Total:</span>
              <span style="font-weight: 700; color: #1f2937; font-size: 18px;">${formatPrice(total)}</span>
            </div>
          </div>

          <!-- Items -->
          <div style="margin-bottom: 24px;">
            <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 18px;">Productos Ordenados</h3>
            <table style="width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb;">
              <thead>
                <tr style="background-color: #f8fafc;">
                  <th style="padding: 16px; text-align: left; font-weight: 600; color: #374151;">Producto</th>
                  <th style="padding: 16px; text-align: right; font-weight: 600; color: #374151;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <!-- Shipping Address -->
          <div style="background-color: #f8fafc; padding: 24px; border-radius: 8px; margin-bottom: 24px;">
            <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 18px;">Dirección de Envío</h3>
            <p style="color: #6b7280; margin: 0; line-height: 1.6;">${shippingAddress}</p>
          </div>

          <!-- Next Steps -->
          <div style="background-color: #ecfdf5; padding: 24px; border-radius: 8px; border-left: 4px solid #10b981;">
            <h3 style="color: #065f46; margin: 0 0 16px 0; font-size: 18px;">Próximos Pasos</h3>
            <ul style="color: #047857; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">Recibirás una notificación cuando tu orden sea procesada</li>
              <li style="margin-bottom: 8px;">Te contactaremos para coordinar la entrega</li>
              <li style="margin-bottom: 8px;">Puedes rastrear tu orden en tu cuenta</li>
            </ul>
          </div>

          <!-- Contact Info -->
          <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; margin: 0 0 8px 0;">¿Tienes preguntas sobre tu orden?</p>
            <p style="color: #6b7280; margin: 0;">
              Contáctanos: <a href="mailto:soporte@lamegatiendagt.com" style="color: #3b82f6; text-decoration: none;">soporte@lamegatiendagt.com</a>
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; margin: 0; font-size: 14px;">
            © 2025 LaMegaTiendaGT. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Envía un correo de notificación de cambio de estado de orden
 */
export async function sendOrderStatusUpdateEmail(orderData, newStatus) {
  try {
    const { orderId, customerEmail, customerName } = orderData;

    const statusMessages = {
      'pendiente': 'Tu orden está pendiente de pago',
      'pagado': 'Tu orden ha sido pagada',
      'validado': 'Tu orden ha sido validada',
      'en_preparacion': 'Tu orden está siendo preparada',
      'enviado': 'Tu orden ha sido enviada',
      'entregado': 'Tu orden ha sido entregada',
      'cancelado': 'Tu orden ha sido cancelada'
    };

    const emailHtml = generateStatusUpdateHTML({
      orderId,
      customerName,
      status: newStatus,
      message: statusMessages[newStatus] || 'El estado de tu orden ha cambiado'
    });

    const result = await resend.emails.send({
      from: `${EMAIL_CONFIG.fromName} <${EMAIL_CONFIG.from}>`,
      to: [customerEmail],
      subject: `Actualización de Orden #${orderId} - ${statusMessages[newStatus]}`,
      html: emailHtml,
      replyTo: EMAIL_CONFIG.replyTo
    });

    console.log('Email de actualización enviado:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error enviando email de actualización:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Genera el HTML para el email de actualización de estado
 */
function generateStatusUpdateHTML({ orderId, customerName, status, message }) {
  const statusColors = {
    'pendiente': '#f59e0b',
    'pagado': '#3b82f6',
    'validado': '#8b5cf6',
    'en_preparacion': '#06b6d4',
    'enviado': '#8b5cf6',
    'entregado': '#10b981',
    'cancelado': '#ef4444'
  };

  const color = statusColors[status] || '#6b7280';

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Actualización de Orden</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8fafc;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 32px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Actualización de Orden</h1>
        </div>

        <!-- Content -->
        <div style="padding: 32px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; background-color: ${color}; color: white; padding: 12px 24px; border-radius: 20px; font-weight: 600; font-size: 16px;">
              ${message}
            </div>
          </div>

          <div style="background-color: #f8fafc; padding: 24px; border-radius: 8px; text-align: center;">
            <h2 style="color: #1f2937; margin: 0 0 8px 0; font-size: 20px;">Hola ${customerName},</h2>
            <p style="color: #6b7280; margin: 0 0 16px 0;">Tu orden #${orderId} ha sido actualizada.</p>
            <p style="color: #6b7280; margin: 0;">Te mantendremos informado sobre cualquier cambio adicional.</p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; margin: 0; font-size: 14px;">
            © 2025 LaMegaTiendaGT. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}
