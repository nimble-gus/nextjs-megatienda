'use client';

import { useState, useEffect } from 'react';
import { useAdminOrders } from '@/contexts/AdminOrdersContext';

const OrderNotifications = () => {
  const { pendingOrdersCount, lastUpdate } = useAdminOrders();
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  useEffect(() => {
    // Mostrar notificación cuando hay nuevas órdenes
    if (pendingOrdersCount > 0) {
      setNotificationMessage(`¡Nueva orden recibida! Tienes ${pendingOrdersCount} orden(es) pendiente(s)`);
      setShowNotification(true);
      
      // Ocultar notificación después de 5 segundos
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [pendingOrdersCount]);

  // Función para reproducir sonido de notificación
  const playNotificationSound = () => {
    try {
      // Crear un audio context para generar un beep
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('No se pudo reproducir sonido de notificación:', error);
    }
  };

  // Escuchar eventos de nuevas órdenes
  useEffect(() => {
    const handleNewOrder = (event) => {
      const { orderNumber } = event.detail;
      setNotificationMessage(`¡Nueva orden #${orderNumber} recibida!`);
      setShowNotification(true);
      
      // Reproducir sonido de notificación
      playNotificationSound();
      
      // Ocultar notificación después de 5 segundos
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    };

    const handleOrderProcessed = (event) => {
      setNotificationMessage('¡Orden procesada exitosamente!');
      setShowNotification(true);
      
      // Ocultar notificación después de 3 segundos
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    };

    const handleClearNotifications = () => {
      setShowNotification(false);
    };

    window.addEventListener('newOrderCreated', handleNewOrder);
    window.addEventListener('orderProcessed', handleOrderProcessed);
    window.addEventListener('clearNotifications', handleClearNotifications);
    
    return () => {
      window.removeEventListener('newOrderCreated', handleNewOrder);
      window.removeEventListener('orderProcessed', handleOrderProcessed);
      window.removeEventListener('clearNotifications', handleClearNotifications);
    };
  }, []);

  if (!showNotification) return null;

  return (
    <div className="order-notification">
      <div className="notification-content">
        <div className="notification-icon">🆕</div>
        <div className="notification-text">
          <div className="notification-title">Nueva Orden</div>
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
  );
};

export default OrderNotifications;
