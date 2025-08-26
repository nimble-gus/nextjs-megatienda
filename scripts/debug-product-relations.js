// Script para diagnosticar las relaciones de un producto
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugProductRelations(productId) {
  console.log(`🔍 Diagnosticando relaciones del producto ID: ${productId}`);
  
  try {
    // Verificar si el producto existe
    const product = await prisma.productos.findUnique({
      where: { id: parseInt(productId) }
    });
    
    if (!product) {
      console.log('❌ Producto no encontrado');
      return;
    }
    
    console.log(`✅ Producto encontrado: ${product.nombre}`);
    
    // Verificar relaciones
    console.log('\n📋 Verificando relaciones...');
    
    // 1. Stock
    const stock = await prisma.stock_detalle.findMany({
      where: { producto_id: parseInt(productId) }
    });
    console.log(`📦 Stock: ${stock.length} registros`);
    
    // 2. Imágenes
    const images = await prisma.imagenes_producto.findMany({
      where: { producto_id: parseInt(productId) }
    });
    console.log(`🖼️ Imágenes: ${images.length} registros`);
    
    // 3. Carrito
    const cart = await prisma.carrito.findMany({
      where: { producto_id: parseInt(productId) }
    });
    console.log(`🛒 Carrito: ${cart.length} registros`);
    
    // 4. Detalles de órdenes
    const orderDetails = await prisma.orden_detalle.findMany({
      where: { producto_id: parseInt(productId) }
    });
    console.log(`📋 Detalles de órdenes: ${orderDetails.length} registros`);
    
    // 5. Productos destacados
    const featured = await prisma.productos_destacados.findMany({
      where: { producto_id: parseInt(productId) }
    });
    console.log(`⭐ Productos destacados: ${featured.length} registros`);
    
    // Resumen
    const totalRelations = stock.length + images.length + cart.length + orderDetails.length + featured.length;
    console.log(`\n📊 Total de relaciones: ${totalRelations}`);
    
    if (totalRelations > 0) {
      console.log('⚠️ El producto tiene relaciones activas que deben eliminarse antes de eliminar el producto');
    } else {
      console.log('✅ El producto no tiene relaciones activas');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Obtener el ID del producto desde los argumentos de línea de comandos
const productId = process.argv[2];

if (!productId) {
  console.log('❌ Por favor proporciona el ID del producto');
  console.log('Uso: node debug-product-relations.js <product_id>');
  process.exit(1);
}

debugProductRelations(productId);
