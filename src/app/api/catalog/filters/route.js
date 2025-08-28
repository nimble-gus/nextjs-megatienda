import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma-production';
import { executeWithRetry, checkDatabaseHealth } from '@/lib/db-utils';
import { FilterCache } from '@/lib/redis';
import { queueQuery } from '@/lib/query-queue';
import 'dotenv/config';

export async function GET() {
  try {
         // Verificar caché Redis primero
     const cachedFilters = await FilterCache.get();
     if (cachedFilters) {
       return NextResponse.json(cachedFilters);
     }
    // Verificar si DATABASE_URL está configurada
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      // Datos de prueba para filtros
      return NextResponse.json({
        categories: [
          { id: 1, name: 'Ropa', productCount: 5 },
          { id: 2, name: 'Electrónica', productCount: 3 },
          { id: 3, name: 'Calzado', productCount: 2 },
          { id: 4, name: 'Accesorios', productCount: 4 }
        ],
        colors: [
          { id: 1, name: 'Negro', hex: '#000000', productCount: 8 },
          { id: 2, name: 'Blanco', hex: '#FFFFFF', productCount: 6 },
          { id: 3, name: 'Azul', hex: '#0000FF', productCount: 4 },
          { id: 4, name: 'Rojo', hex: '#FF0000', productCount: 3 }
        ],
        priceRange: {
          min: 10,
          max: 500
        }
      });
    }
    
    // Si DATABASE_URL está configurada, intentar usar Prisma
    try {
      const { prisma } = await import('@/lib/prisma');
      const { executeWithRetry, checkDatabaseHealth } = await import('@/lib/db-utils');
      // Verificar salud de la conexión
      const health = await checkDatabaseHealth();
             // Obtener todas las categorías con cola de consultas
       const categories = await queueQuery(async () => {
         return await executeWithRetry(async () => {
           return await prisma.categorias.findMany({
             select: {
               id: true,
               nombre: true,
               _count: {
                 select: {
                   productos: true
                 }
               }
             },
             orderBy: {
               nombre: 'asc'
             }
           });
         });
       });

             // Obtener todos los colores con cola de consultas
       const colors = await queueQuery(async () => {
         return await executeWithRetry(async () => {
           return await prisma.colores.findMany({
             select: {
               id: true,
               nombre: true,
               codigo_hex: true,
               _count: {
                 select: {
                   stock: true
                 }
               }
             },
             orderBy: {
               nombre: 'asc'
             }
           });
         });
       });

             // Obtener rangos de precios con cola de consultas
       const priceStats = await queueQuery(async () => {
         return await executeWithRetry(async () => {
           return await prisma.stock_detalle.aggregate({
             _min: {
               precio: true
             },
             _max: {
               precio: true
             }
           });
         });
       });

      // Formatear respuesta
      const formattedCategories = categories.map(cat => ({
        id: cat.id,
        name: cat.nombre,
        productCount: cat._count.productos
      }));

      const formattedColors = colors.map(color => ({
        id: color.id,
        name: color.nombre,
        hex: color.codigo_hex,
        productCount: color._count.stock
      }));
      const responseData = {
        categories: formattedCategories,
        colors: formattedColors,
        priceRange: {
          min: priceStats._min.precio || 0,
          max: priceStats._max.precio || 1000
        }
      };
      
             // Almacenar en caché Redis para futuras consultas
       await FilterCache.set(responseData);
      return NextResponse.json(responseData);
      
    } catch (dbError) {
      console.error('❌ Error de base de datos:', dbError);
      
      // Devolver datos de prueba si hay error de BD
      return NextResponse.json({
        categories: [
          { id: 1, name: 'Ropa', productCount: 5 },
          { id: 2, name: 'Electrónica', productCount: 3 },
          { id: 3, name: 'Calzado', productCount: 2 },
          { id: 4, name: 'Accesorios', productCount: 4 }
        ],
        colors: [
          { id: 1, name: 'Negro', hex: '#000000', productCount: 8 },
          { id: 2, name: 'Blanco', hex: '#FFFFFF', productCount: 6 },
          { id: 3, name: 'Azul', hex: '#0000FF', productCount: 4 },
          { id: 4, name: 'Rojo', hex: '#FF0000', productCount: 3 }
        ],
        priceRange: {
          min: 10,
          max: 500
        }
      });
    }

  } catch (error) {
    console.error('=== ERROR EN API /api/catalog/filters ===');
    console.error('Error completo:', error);
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
