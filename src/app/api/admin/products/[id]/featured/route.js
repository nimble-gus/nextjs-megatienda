import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { invalidateProductCache } from '@/lib/cache-manager';

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const { featured } = await request.json();
    // Validar que el producto existe
    const existingProduct = await prisma.productos.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Producto no encontrado' },
        { status: 404 }
      );
    }
    
    // Actualizar el estado featured
    const updatedProduct = await prisma.productos.update({
      where: { id: parseInt(id) },
      data: { featured: featured }
    });

    // Invalidar caché de productos
    await invalidateProductCache();

    return NextResponse.json({
      success: true,
      product: {
        id: updatedProduct.id,
        name: updatedProduct.nombre,
        featured: updatedProduct.featured
      }
    });
    
  } catch (error) {
    console.error('=== ERROR EN API /api/admin/products/[id]/featured ===');
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
