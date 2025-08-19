// Queue de procesamiento de pedidos para manejar carga alta
class OrderQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.maxConcurrent = 3; // Máximo 3 pedidos procesándose simultáneamente
    this.processingOrders = new Set();
    this.stats = {
      totalProcessed: 0,
      totalFailed: 0,
      averageProcessingTime: 0
    };
  }

  // Agregar pedido a la cola
  async addOrder(orderData, processFunction) {
    return new Promise((resolve, reject) => {
      const orderItem = {
        id: Date.now() + Math.random(),
        orderData,
        processFunction,
        resolve,
        reject,
        timestamp: Date.now(),
        status: 'queued'
      };

      this.queue.push(orderItem);
      console.log(`📦 Pedido agregado a la cola. Posición: ${this.queue.length}`);
      
      // Iniciar procesamiento si no está activo
      this.processQueue();
    });
  }

  // Procesar la cola
  async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;
    console.log(`🔄 Iniciando procesamiento de cola. Pedidos en cola: ${this.queue.length}`);

    while (this.queue.length > 0 && this.processingOrders.size < this.maxConcurrent) {
      const orderItem = this.queue.shift();
      if (orderItem) {
        this.processOrder(orderItem);
      }
    }

    this.processing = false;
  }

  // Procesar un pedido individual
  async processOrder(orderItem) {
    const startTime = Date.now();
    orderItem.status = 'processing';
    this.processingOrders.add(orderItem.id);

    try {
      console.log(`⚡ Procesando pedido ${orderItem.id}...`);
      
      // Simular un pequeño delay para evitar saturación
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Procesar el pedido
      const result = await orderItem.processFunction(orderItem.orderData);
      
      const processingTime = Date.now() - startTime;
      this.updateStats(processingTime, true);
      
      orderItem.status = 'completed';
      console.log(`✅ Pedido ${orderItem.id} procesado exitosamente en ${processingTime}ms`);
      
      orderItem.resolve(result);
      
    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.updateStats(processingTime, false);
      
      orderItem.status = 'failed';
      console.error(`❌ Error procesando pedido ${orderItem.id}:`, error.message);
      
      orderItem.reject(error);
      
    } finally {
      this.processingOrders.delete(orderItem.id);
      
      // Continuar procesando la cola
      if (this.queue.length > 0) {
        setTimeout(() => this.processQueue(), 50); // Pequeño delay entre pedidos
      }
    }
  }

  // Actualizar estadísticas
  updateStats(processingTime, success) {
    this.stats.totalProcessed++;
    if (!success) {
      this.stats.totalFailed++;
    }
    
    // Calcular tiempo promedio de procesamiento
    const totalTime = this.stats.averageProcessingTime * (this.stats.totalProcessed - 1) + processingTime;
    this.stats.averageProcessingTime = totalTime / this.stats.totalProcessed;
  }

  // Obtener estadísticas de la cola
  getStats() {
    return {
      ...this.stats,
      queueLength: this.queue.length,
      processingCount: this.processingOrders.size,
      isProcessing: this.processing
    };
  }

  // Obtener posición en cola de un pedido
  getQueuePosition(orderId) {
    const index = this.queue.findIndex(item => item.id === orderId);
    return index >= 0 ? index + 1 : null;
  }

  // Limpiar cola (para emergencias)
  clearQueue() {
    this.queue.forEach(item => {
      item.reject(new Error('Cola limpiada por administrador'));
    });
    this.queue = [];
    console.log('🧹 Cola de pedidos limpiada');
  }

  // Pausar procesamiento
  pause() {
    this.processing = false;
    console.log('⏸️ Procesamiento de cola pausado');
  }

  // Reanudar procesamiento
  resume() {
    console.log('▶️ Reanudando procesamiento de cola');
    this.processQueue();
  }
}

// Instancia global de la cola de pedidos
export const orderQueue = new OrderQueue();

// Función helper para agregar pedido a la cola
export async function queueOrder(orderData, processFunction) {
  return await orderQueue.addOrder(orderData, processFunction);
}

// Función para obtener estadísticas
export function getQueueStats() {
  return orderQueue.getStats();
}
