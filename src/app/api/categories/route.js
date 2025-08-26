import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CategoryCache } from '@/lib/redis';

export async function GET() {
  try {
    // Verificar caché Redis primero
    const cachedCategories = await CategoryCache.get();
    if (cachedCategories) {
      return NextResponse.json(cachedCategories);
    }

    // Obtener categorías con conteo de productos
    const categories = await prisma.categorias.findMany({
      include: {
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
    
    // Formatear categorías para el frontend
    const formattedCategories = categories.map(category => ({
      id: category.id,
      nombre: category.nombre,
      productos: category._count.productos,
      descripcion: `Explora nuestra selección de ${category.nombre.toLowerCase()}`
    }));

    const responseData = {
      success: true,
      categories: formattedCategories,
      total: categories.length
    };
    
    // Almacenar en caché Redis para futuras consultas
    await CategoryCache.set(responseData);
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('=== ERROR EN API /api/categories ===');
    console.error('Error completo:', error);
    console.error('Stack trace:', error.stack);
    console.error('Mensaje:', error.message);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Error interno del servidor',
        details: error.message
      },
      { status: 500 }
    );
  }
}