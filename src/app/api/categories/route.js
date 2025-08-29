import { NextResponse } from 'next/server';
import { getCategories } from '@/lib/mysql-direct';
import { CategoryCache } from '@/lib/redis';

export async function GET() {
  try {
    // Verificar caché Redis primero
    const cachedCategories = await CategoryCache.get();
    if (cachedCategories) {
      return NextResponse.json(cachedCategories);
    }

    // Obtener categorías usando conexión directa
    const categories = await getCategories();
    
    // Formatear categorías para el frontend
    const formattedCategories = categories.map(category => ({
      id: category.id,
      nombre: category.nombre,
      productos: category.productos_count || 0,
      descripcion: `Explora nuestra selección de ${category.nombre.toLowerCase()}`,
      image: null // La tabla categorias no tiene url_imagen
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