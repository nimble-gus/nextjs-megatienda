import { NextResponse } from 'next/server';

// Store para mantener las conexiones SSE activas
const connections = new Set();

export async function GET(request) {
  const controller = new AbortController();
  const stream = new ReadableStream({
    start(controller) {
      const connection = {
        sendData: (data) => {
          try {
            controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
          } catch (error) {
            console.log('Error enviando datos SSE:', error.message);
          }
        },
        controller,
        isActive: true
      };
      
      connections.add(connection);

      const keepAlive = () => {
        if (connection.isActive) {
          connection.sendData({ type: 'ping', timestamp: new Date().toISOString() });
        }
      };
      
      const pingInterval = setInterval(keepAlive, 30000);
      const maxLifetimeTimeout = setTimeout(() => {
        cleanup();
      }, 5 * 60 * 1000); // 5 minutos

      const cleanup = () => {
        if (!connection.isActive) return; // Evitar limpieza múltiple
        
        connection.isActive = false;
        clearInterval(pingInterval);
        clearTimeout(maxLifetimeTimeout);
        connections.delete(connection);
        
        try {
          if (controller.desiredSize !== null) {
            controller.close();
          }
        } catch (error) {
          // Ignorar errores de controller ya cerrado
          console.log('Controller ya cerrado, ignorando error:', error.message);
        }
      };

      // Enviar mensaje de conexión establecida
      connection.sendData({ 
        type: 'connected', 
        message: 'Conexión establecida',
        timestamp: new Date().toISOString()
      });

      // Detectar cuando se cierra la conexión
      request.signal.addEventListener('abort', cleanup);
      
      // Guardar referencia para poder limpiarla
      connection.cleanup = cleanup;
    },
    cancel() {
      // This is called when the client disconnects
      // The cleanup function attached to request.signal.addEventListener('abort') handles this
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  });
}

// Función para enviar notificaciones a todos los clientes conectados
export function broadcastNotification(type, data) {
  const message = {
    type,
    data,
    timestamp: new Date().toISOString()
  };

  const connectionsToRemove = [];
  
  connections.forEach(connection => {
    try {
      // Solo enviar si la conexión está activa
      if (connection.isActive) {
        connection.sendData(message);
      } else {
        // Marcar conexión inactiva para remover
        connectionsToRemove.push(connection);
      }
    } catch (error) {
      console.log('Error enviando notificación SSE:', error.message);
      // Marcar conexión para remover
      connectionsToRemove.push(connection);
    }
  });
  
  // Remover conexiones con error o inactivas
  connectionsToRemove.forEach(connection => {
    if (connection.cleanup) {
      connection.cleanup();
    }
    connections.delete(connection);
  });
}

// Función para enviar notificación de nueva orden
export function notifyNewOrder(orderData) {
  broadcastNotification('newOrder', {
    orderId: orderData.id,
    orderNumber: orderData.codigo_orden,
    customerName: orderData.nombre_cliente,
    total: orderData.total,
    paymentMethod: orderData.metodo_pago,
    timestamp: new Date().toISOString()
  });
}

// Función para enviar notificación de orden procesada
export function notifyOrderProcessed(orderData) {
  broadcastNotification('orderProcessed', {
    orderId: orderData.id,
    orderNumber: orderData.codigo_orden,
    newStatus: orderData.estado,
    timestamp: new Date().toISOString()
  });
}
