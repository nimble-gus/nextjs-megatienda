// Script para verificar las imágenes de los productos
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkProductImages() {
  console.log('🔍 Verificando imágenes de productos...');
  
  try {
    // Obtener todos los productos con sus imágenes
    const products = await prisma.productos.findMany({
      include: {
        imagenes: true
      }
    });
    
    console.log(`📦 Total de productos: ${products.length}`);
    
    products.forEach((product, index) => {
      console.log(`\n${index + 1}. Producto: ${product.nombre} (ID: ${product.id})`);
      console.log(`   - url_imagen: ${product.url_imagen || '❌ No configurada'}`);
      console.log(`   - Imágenes adicionales: ${product.imagenes.length}`);
      
      if (product.imagenes.length > 0) {
        product.imagenes.forEach((img, imgIndex) => {
          console.log(`     ${imgIndex + 1}. ${img.url_imagen}`);
        });
      }
      
      if (!product.url_imagen && product.imagenes.length === 0) {
        console.log('   ⚠️  Este producto no tiene imágenes configuradas');
      }
    });
    
    // Resumen
    const productsWithMainImage = products.filter(p => p.url_imagen);
    const productsWithAdditionalImages = products.filter(p => p.imagenes.length > 0);
    const productsWithoutImages = products.filter(p => !p.url_imagen && p.imagenes.length === 0);
    
    console.log('\n📊 Resumen:');
    console.log(`- Productos con imagen principal: ${productsWithMainImage.length}`);
    console.log(`- Productos con imágenes adicionales: ${productsWithAdditionalImages.length}`);
    console.log(`- Productos sin imágenes: ${productsWithoutImages.length}`);
    
    if (productsWithoutImages.length > 0) {
      console.log('\n⚠️  Productos sin imágenes:');
      productsWithoutImages.forEach(p => {
        console.log(`  - ${p.nombre} (ID: ${p.id})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProductImages();
