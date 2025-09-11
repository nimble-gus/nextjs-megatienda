import { useState, useEffect, useRef, useCallback } from 'react';

export const useRealtimeNotifications = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastNotification, setLastNotification] = useState(null);
  const [connectionError, setConnectionError] = useState(null);
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 10; // Aumentar intentos para producción

  // Función para reproducir sonido de notificación
  const playNotificationSound = useCallback((type = 'newOrder') => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      if (type === 'newOrder') {
        // Sonido para nueva orden: beep ascendente
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.2);
      } else if (type === 'orderProcessed') {
        // Sonido para orden procesada: beep descendente
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime + 0.2);
      }
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('No se pudo reproducir sonido de notificación:', error);
    }
  }, []);

  // Función para conectar al SSE
  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      const eventSource = new EventSource('/api/admin/notifications');
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('🔗 Conexión SSE establecida');
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttempts.current = 0;
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'ping') {
            // Ignorar pings de keep-alive
            return;
          }

          if (data.type === 'connected') {
            console.log('✅ Conectado al sistema de notificaciones en tiempo real');
            // En producción, la conexión se cerrará automáticamente después de 25 segundos
            if (data.maxConnectionTime && data.maxConnectionTime < 60000) {
              console.log('⚠️ Conexión de producción: se reconectará automáticamente');
            }
            return;
          }

          // Procesar notificaciones
          if (data.type === 'newOrder') {
            console.log('🆕 Nueva orden recibida:', data.data);
            setLastNotification({
              type: 'newOrder',
              data: data.data,
              timestamp: data.timestamp
            });
            playNotificationSound('newOrder');
            
            // Disparar evento personalizado para compatibilidad
            window.dispatchEvent(new CustomEvent('newOrderCreated', {
              detail: { orderNumber: data.data.orderNumber }
            }));
          }

          if (data.type === 'orderProcessed') {
            console.log('✅ Orden procesada:', data.data);
            setLastNotification({
              type: 'orderProcessed',
              data: data.data,
              timestamp: data.timestamp
            });
            playNotificationSound('orderProcessed');
            
            // Disparar evento personalizado para compatibilidad
            window.dispatchEvent(new CustomEvent('orderProcessed', {
              detail: { orderNumber: data.data.orderNumber }
            }));
          }

        } catch (error) {
          console.error('Error procesando mensaje SSE:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('❌ Error en conexión SSE:', error);
        setIsConnected(false);
        
        // Cerrar la conexión actual
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }
        
        // Intentar reconectar solo si no hemos alcanzado el máximo
        if (reconnectAttempts.current < maxReconnectAttempts) {
          // En producción, reconectar más rápido debido a los timeouts de 25 segundos
          const isProduction = window.location.hostname !== 'localhost';
          const baseDelay = isProduction ? 2000 : 1000; // 2 segundos en prod, 1 en dev
          const delay = Math.min(baseDelay * Math.pow(1.5, reconnectAttempts.current), 10000); // Max 10 segundos
          
          console.log(`🔄 Reintentando conexión en ${delay}ms... (intento ${reconnectAttempts.current + 1}/${maxReconnectAttempts})`);
          setConnectionError(`Reintentando conexión... (${reconnectAttempts.current + 1}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        } else {
          console.error('❌ Máximo de intentos de reconexión alcanzado');
          setConnectionError('No se pudo establecer conexión. Recarga la página para intentar de nuevo.');
        }
      };

    } catch (error) {
      console.error('Error creando conexión SSE:', error);
      setConnectionError('Error inicializando conexión');
    }
  }, [playNotificationSound]);

  // Función para desconectar
  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    setIsConnected(false);
    reconnectAttempts.current = 0;
  }, []);

  // Conectar al montar el componente
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    lastNotification,
    connectionError,
    connect,
    disconnect,
    playNotificationSound
  };
};
