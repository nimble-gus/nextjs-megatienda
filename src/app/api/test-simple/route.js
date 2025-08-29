import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma-vercel';

export async function GET() {
  try {
    // Test 1: Conexión básica sin Redis
    const basicTest = await prisma.$queryRaw`SELECT 1 as test`;
    
    // Test 2: Verificar tabla categorias
    const categories = await prisma.categorias.findMany({ take: 1 });
    
    // Test 3: Verificar tabla productos
    const products = await prisma.productos.findMany({ take: 1 });
    
    return NextResponse.json({
      success: true,
      message: 'Prueba simple exitosa',
      data: {
        basicTest,
        categoriesCount: categories.length,
        productsCount: products.length,
        databaseUrl: process.env.DATABASE_URL ? 'Configurada' : 'No configurada'
      }
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      databaseUrl: process.env.DATABASE_URL ? 'Configurada' : 'No configurada'
    }, { status: 500 });
  }
}
