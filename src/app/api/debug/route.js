import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('=== API DEBUG iniciada ===');
    
    // 1. Probar conexión básica
    console.log('1. Probando conexión básica...');
    const productCount = await prisma.productos.count();
    console.log('Total productos:', productCount);
    
    // 2. Probar obtener productos sin relaciones
    console.log('2. Probando obtener productos sin relaciones...');
    const simpleProducts = await prisma.productos.findMany({
      take: 2
    });
    console.log('Productos simples obtenidos:', simpleProducts.length);
    console.log('Primer producto:', JSON.stringify(simpleProducts[0], null, 2));
    
    // 3. Probar obtener productos con categoría
    console.log('3. Probando obtener productos con categoría...');
    const productsWithCategory = await prisma.productos.findMany({
      include: {
        categoria: true
      },
      take: 2
    });
    console.log('Productos con categoría obtenidos:', productsWithCategory.length);
    console.log('Primer producto con categoría:', JSON.stringify(productsWithCategory[0], null, 2));
    
    // 4. Probar obtener productos con stock
    console.log('4. Probando obtener productos con stock...');
    const productsWithStock = await prisma.productos.findMany({
      include: {
        stock: {
          include: {
            color: true
          }
        }
      },
      take: 2
    });
    console.log('Productos con stock obtenidos:', productsWithStock.length);
    console.log('Primer producto con stock:', JSON.stringify(productsWithStock[0], null, 2));
    
    // 5. Probar obtener productos con todo
    console.log('5. Probando obtener productos con todo...');
    const productsWithAll = await prisma.productos.findMany({
      include: {
        categoria: true,
        imagenes: {
          take: 1
        },
        stock: {
          include: {
            color: true
          }
        }
      },
      take: 2
    });
    console.log('Productos con todo obtenidos:', productsWithAll.length);
    console.log('Primer producto con todo:', JSON.stringify(productsWithAll[0], null, 2));
    
    return NextResponse.json({
      success: true,
      tests: {
        basicConnection: productCount,
        simpleProducts: simpleProducts.length,
        productsWithCategory: productsWithCategory.length,
        productsWithStock: productsWithStock.length,
        productsWithAll: productsWithAll.length
      },
      sampleProduct: productsWithAll[0] || null
    });
    
  } catch (error) {
    console.error('=== ERROR EN API DEBUG ===');
    console.error('Error completo:', error);
    console.error('Stack trace:', error.stack);
    console.error('Mensaje:', error.message);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Error en debug API',
        details: error.message,
        stack: error.stack
      },
      { status: 500 }
    );
  }
}
