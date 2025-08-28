import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma-simple';

export async function GET() {
  try {
    const results = {
      timestamp: new Date().toISOString(),
      tests: {}
    };

    // Test 1: Conexión básica
    try {
      const basicTest = await prisma.$queryRaw`SELECT 1 as test`;
      results.tests.basicConnection = { success: true, data: basicTest };
    } catch (error) {
      results.tests.basicConnection = { success: false, error: error.message };
    }

    // Test 2: Verificar si las tablas existen
    try {
      const tables = await prisma.$queryRaw`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = DATABASE()
      `;
      results.tests.tables = { success: true, data: tables };
    } catch (error) {
      results.tests.tables = { success: false, error: error.message };
    }

    // Test 3: Verificar tabla categorias
    try {
      const categories = await prisma.categorias.findMany({ take: 1 });
      results.tests.categorias = { success: true, count: categories.length };
    } catch (error) {
      results.tests.categorias = { success: false, error: error.message };
    }

    // Test 4: Verificar tabla productos
    try {
      const products = await prisma.productos.findMany({ take: 1 });
      results.tests.productos = { success: true, count: products.length };
    } catch (error) {
      results.tests.productos = { success: false, error: error.message };
    }

    // Test 5: Verificar tabla hero_images
    try {
      const heroImages = await prisma.hero_images.findMany({ take: 1 });
      results.tests.hero_images = { success: true, count: heroImages.length };
    } catch (error) {
      results.tests.hero_images = { success: false, error: error.message };
    }

    // Test 6: Verificar tabla promo_banners
    try {
      const promoBanners = await prisma.promo_banners.findMany({ take: 1 });
      results.tests.promo_banners = { success: true, count: promoBanners.length };
    } catch (error) {
      results.tests.promo_banners = { success: false, error: error.message };
    }

    // Test 7: Verificar variables de entorno
    results.environment = {
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      databaseUrlPreview: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 30) + '...' : 'No configurada',
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV
    };

    return NextResponse.json({
      success: true,
      ...results
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
