import { NextResponse } from 'next/server';
import { getFeaturedProducts, getCategories, getHeroImages, getPromoBanners } from '@/lib/mysql-direct';

export async function GET() {
  const results = {
    timestamp: new Date().toISOString(),
    tests: {}
  };

  // Test 1: Productos destacados
  try {
    const featuredProducts = await getFeaturedProducts();
    results.tests.featuredProducts = {
      success: true,
      count: featuredProducts.length,
      data: featuredProducts.slice(0, 2) // Solo los primeros 2 para no saturar
    };
  } catch (error) {
    results.tests.featuredProducts = {
      success: false,
      error: error.message
    };
  }

  // Test 2: Categorías
  try {
    const categories = await getCategories();
    results.tests.categories = {
      success: true,
      count: categories.length,
      data: categories
    };
  } catch (error) {
    results.tests.categories = {
      success: false,
      error: error.message
    };
  }

  // Test 3: Hero Images
  try {
    const heroImages = await getHeroImages();
    results.tests.heroImages = {
      success: true,
      count: heroImages.length,
      data: heroImages
    };
  } catch (error) {
    results.tests.heroImages = {
      success: false,
      error: error.message
    };
  }

  // Test 4: Promo Banners
  try {
    const promoBanners = await getPromoBanners();
    results.tests.promoBanners = {
      success: true,
      count: promoBanners.length,
      data: promoBanners
    };
  } catch (error) {
    results.tests.promoBanners = {
      success: false,
      error: error.message
    };
  }

  return NextResponse.json({
    success: true,
    message: 'Diagnóstico de endpoints completado',
    ...results
  });
}
