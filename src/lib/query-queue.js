// Sistema de cola de consultas para evitar saturación del motor de Prisma
class QueryQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.maxConcurrent = 2; // Reducir a 2 consultas simultáneas para evitar saturación
    this.delay = 100; // Aumentar delay a 100ms para dar más tiempo al motor
    this.activeQueries = 0;
  }

  // Agregar consulta a la cola
  add(queryFn) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        queryFn,
        resolve,
        reject,
        timestamp: Date.now()
      });
      
      this.processQueue();
    });
  }

  // Procesar la cola
  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0 && this.activeQueries < this.maxConcurrent) {
      const { queryFn, resolve, reject } = this.queue.shift();
      this.activeQueries++;
      
      // Ejecutar la consulta en paralelo
      this.executeQuery(queryFn, resolve, reject);
      
      // Esperar antes de la siguiente consulta
      if (this.queue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, this.delay));
      }
    }

    this.isProcessing = false;
  }

  // Ejecutar una consulta individual
  async executeQuery(queryFn, resolve, reject) {
    try {
      const result = await queryFn();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.activeQueries--;
      
      // Continuar procesando si hay más elementos en la cola
      if (this.queue.length > 0 && this.activeQueries < this.maxConcurrent) {
        this.processQueue();
      }
    }
  }

  // Limpiar la cola
  clear() {
    this.queue = [];
  }

  // Obtener tamaño de la cola
  get size() {
    return this.queue.length;
  }

  // Verificar si está procesando
  get processing() {
    return this.isProcessing;
  }

  // Obtener estadísticas de la cola
  get stats() {
    return {
      queueSize: this.queue.length,
      isProcessing: this.isProcessing,
      activeQueries: this.activeQueries,
      maxConcurrent: this.maxConcurrent
    };
  }
}

// Instancia global de la cola
export const queryQueue = new QueryQueue();

// Función helper para usar la cola
export const queueQuery = (queryFn) => {
  return queryQueue.add(queryFn);
};
