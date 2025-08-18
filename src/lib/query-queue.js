// Sistema de cola de consultas para evitar saturación del motor de Prisma
class QueryQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.maxConcurrent = 1; // Solo una consulta a la vez
    this.delay = 300; // 300ms entre consultas
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

    while (this.queue.length > 0) {
      const { queryFn, resolve, reject } = this.queue.shift();
      
      try {
        // Ejecutar la consulta
        const result = await queryFn();
        resolve(result);
        
        // Esperar antes de la siguiente consulta
        if (this.queue.length > 0) {
          await new Promise(resolve => setTimeout(resolve, this.delay));
        }
      } catch (error) {
        reject(error);
      }
    }

    this.isProcessing = false;
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
}

// Instancia global de la cola
export const queryQueue = new QueryQueue();

// Función helper para usar la cola
export const queueQuery = (queryFn) => {
  return queryQueue.add(queryFn);
};
