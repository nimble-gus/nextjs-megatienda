// src/lib/prisma-wrapper.js
import { prisma, checkPrismaHealth } from './prisma.js';

// Configuración de reintentos
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 segundo

// Función de delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Wrapper con reintentos para operaciones de Prisma
export async function withPrismaRetry(operation, retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Verificar salud de la conexión antes de cada intento
      const health = await checkPrismaHealth();
      if (!health.healthy) {
        console.log(`🔄 Intento ${attempt}: Reintentando conexión...`);
        await delay(RETRY_DELAY);
        continue;
      }

      // Ejecutar la operación
      const result = await operation();
      return result;

    } catch (error) {
      console.error(`❌ Error en intento ${attempt}/${retries}:`, error.message);

      // Si es el último intento, lanzar el error
      if (attempt === retries) {
        throw error;
      }

      // Si es un error de conexión, reintentar
      if (error.message.includes('Engine') || 
          error.message.includes('empty') || 
          error.message.includes('connection')) {
        console.log(`🔄 Reintentando en ${RETRY_DELAY}ms...`);
        await delay(RETRY_DELAY);
        continue;
      }

      // Para otros errores, no reintentar
      throw error;
    }
  }
}

// Funciones específicas con reintentos
export async function safeQueryRaw(query, ...params) {
  return withPrismaRetry(() => prisma.$queryRaw(query, ...params));
}

export async function safeCount(model, where = {}) {
  return withPrismaRetry(() => prisma[model].count({ where }));
}

export async function safeFindMany(model, options = {}) {
  return withPrismaRetry(() => prisma[model].findMany(options));
}

export async function safeFindUnique(model, options = {}) {
  return withPrismaRetry(() => prisma[model].findUnique(options));
}

export async function safeCreate(model, data) {
  return withPrismaRetry(() => prisma[model].create({ data }));
}

export async function safeUpdate(model, options) {
  return withPrismaRetry(() => prisma[model].update(options));
}

export async function safeDelete(model, options) {
  return withPrismaRetry(() => prisma[model].delete(options));
}

// Función para limpiar conexiones
export async function cleanupPrisma() {
  try {
    await prisma.$disconnect();
    console.log('✅ Conexión de Prisma cerrada correctamente');
  } catch (error) {
    console.error('❌ Error al cerrar conexión de Prisma:', error);
  }
}

// Manejo de señales para limpieza
if (typeof process !== 'undefined') {
  process.on('beforeExit', cleanupPrisma);
  process.on('SIGINT', cleanupPrisma);
  process.on('SIGTERM', cleanupPrisma);
}
