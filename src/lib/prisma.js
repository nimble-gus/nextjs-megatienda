// src/lib/prisma.js
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Configuraciones adicionales para estabilidad
    __internal: {
      engine: {
        binaryPath: undefined,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Manejo de errores mejorado
prisma.$on('query', (e) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Query:', e.query);
    console.log('⏱️  Duración:', e.duration + 'ms');
  }
});

prisma.$on('error', (e) => {
  console.error('❌ Error de Prisma:', e);
});

// Función para verificar la salud de la conexión
export async function checkPrismaHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { healthy: true };
  } catch (error) {
    console.error('❌ Prisma health check failed:', error);
    return { healthy: false, error: error.message };
  }
}
