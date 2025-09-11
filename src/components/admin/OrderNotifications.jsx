'use client';

import { useState, useEffect } from 'react';
import { useAdminOrders } from '@/contexts/AdminOrdersContext';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';

const OrderNotifications = () => {
  const { pendingOrdersCount, lastUpdate } = useAdminOrders();
  const { isConnected, lastNotification, connectionError } = useRealtimeNotifications();
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('');

  // Mostrar notificación cuando llega una nueva notificación en tiempo real
  useEffect(() => {
    if (lastNotification) {
      if (lastNotification.type === 'newOrder') {
        const { orderNumber, customerName, total, paymentMethod } = lastNotification.data;
        setNotificationMessage(`¡Nueva orden #${orderNumber} de ${customerName}! Total: Q${total} (${paymentMethod})`);
        setNotificationType('newOrder');
      } else if (lastNotification.type === 'orderProcessed') {
        const { orderNumber, newStatus } = lastNotification.data;
        setNotificationMessage(`Orden #${orderNumber} actualizada a: ${newStatus}`);
        setNotificationType('orderProcessed');
      }
      
      setShowNotification(true);
      
      // Ocultar notificación después de 5 segundos
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [lastNotification]);

  // Mostrar notificación cuando hay nuevas órdenes (fallback)
  useEffect(() => {
    if (pendingOrdersCount > 0 && !lastNotification) {
      setNotificationMessage(`¡Nueva orden recibida! Tienes ${pendingOrdersCount} orden(es) pendiente(s)`);
      setNotificationType('newOrder');
      setShowNotification(true);
      
      // Ocultar notificación después de 5 segundos
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [pendingOrdersCount, lastNotification]);

  if (!showNotification) return null;

  return (
    <>
      {/* Indicador de estado de conexión */}
      <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
        <div className="status-indicator">
          <span className="status-dot"></span>
          <span className="status-text">
            {isConnected ? 'Tiempo Real Activo' : 'Sin Conexión'}
          </span>
        </div>
        {connectionError && (
          <div className="connection-error">
            {connectionError}
          </div>
        )}
      </div>

      {/* Notificación */}
      <div className={`order-notification ${notificationType}`}>
        <div className="notification-content">
          <div className="notification-icon">
            {notificationType === 'newOrder' ? '🆕' : '✅'}
          </div>
          <div className="notification-text">
            <div className="notification-title">
              {notificationType === 'newOrder' ? 'Nueva Orden' : 'Orden Actualizada'}
            </div>
            <div className="notification-message">{notificationMessage}</div>
          </div>
          <button 
            className="notification-close"
            onClick={() => setShowNotification(false)}
          >
            ×
          </button>
        </div>
      </div>
    </>
  );
};

export default OrderNotifications;
