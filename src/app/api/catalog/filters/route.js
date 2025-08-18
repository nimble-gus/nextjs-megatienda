import { NextResponse } from 'next/server';
import 'dotenv/config';

export async function GET() {
  try {
    console.log('=== API /api/catalog/filters iniciada ===');
    
    // Verificar si DATABASE_URL está configurada
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.log('❌ DATABASE_URL no configurada, devolviendo filtros de prueba');
      
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
    console.log('✅ DATABASE_URL configurada, intentando conectar a la base de datos');
    
    try {
      const { prisma } = await import('@/lib/prisma');
      
      console.log('✅ Intentando conectar a la base de datos...');
      
      // Obtener todas las categorías
      const categories = await prisma.categorias.findMany({
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

      // Obtener todos los colores
      const colors = await prisma.colores.findMany({
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

      // Obtener rangos de precios
      const priceStats = await prisma.stock_detalle.aggregate({
        _min: {
          precio: true
        },
        _max: {
          precio: true
        }
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

      await prisma.$disconnect();
      
      console.log('✅ Filtros obtenidos exitosamente');
      
      return NextResponse.json({
        categories: formattedCategories,
        colors: formattedColors,
        priceRange: {
          min: priceStats._min.precio || 0,
          max: priceStats._max.precio || 1000
        }
      });
      
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
