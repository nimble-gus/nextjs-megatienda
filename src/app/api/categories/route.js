import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('=== API /api/categories iniciada ===');
    
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
    
    console.log('Categorías obtenidas:', categories.length);
    
    // Formatear categorías para el frontend
    const formattedCategories = categories.map(category => ({
      id: category.id,
      nombre: category.nombre,
      productos: category._count.productos,
      descripcion: `Explora nuestra selección de ${category.nombre.toLowerCase()}`
    }));
    
    console.log('Categorías formateadas:', formattedCategories);
    
    return NextResponse.json({
      success: true,
      categories: formattedCategories,
      total: categories.length
    });
    
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