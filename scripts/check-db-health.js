#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

async function checkDatabaseHealth() {
  console.log('🔍 Verificando salud de la base de datos...\n');
  
  const prisma = new PrismaClient();
  
  try {
    // 1. Verificar conexión básica
    console.log('📡 Probando conexión básica...');
    await prisma.$connect();
    console.log('✅ Conexión exitosa\n');
    
    // 2. Verificar que las tablas existen
    console.log('📋 Verificando estructura de tablas...');
    const tables = await prisma.$queryRaw`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
    `;
    console.log('✅ Tablas encontradas:', tables.length);
    tables.forEach(table => {
      console.log(`   - ${table.TABLE_NAME}`);
    });
    console.log('');
    
    // 3. Verificar usuarios
    console.log('👥 Verificando tabla de usuarios...');
    const userCount = await prisma.usuarios.count();
    console.log(`✅ Usuarios en la base de datos: ${userCount}`);
    
    if (userCount > 0) {
      const sampleUser = await prisma.usuarios.findFirst({
        select: { id: true, nombre: true, correo: true, rol: true }
      });
      console.log(`   Usuario de ejemplo: ${sampleUser.nombre} (${sampleUser.correo}) - Rol: ${sampleUser.rol}`);
    }
    console.log('');
    
    // 4. Verificar productos
    console.log('📦 Verificando tabla de productos...');
    const productCount = await prisma.productos.count();
    console.log(`✅ Productos en la base de datos: ${productCount}`);
    console.log('');
    
    // 5. Verificar categorías
    console.log('🏷️ Verificando tabla de categorías...');
    const categoryCount = await prisma.categorias.count();
    console.log(`✅ Categorías en la base de datos: ${categoryCount}`);
    console.log('');
    
    // 6. Verificar pedidos
    console.log('📋 Verificando tabla de pedidos...');
    const orderCount = await prisma.ordenes.count();
    console.log(`✅ Pedidos en la base de datos: ${orderCount}`);
    console.log('');
    
    // 7. Verificar rendimiento
    console.log('⚡ Probando rendimiento...');
    const startTime = Date.now();
    await prisma.usuarios.findMany({ take: 1 });
    const queryTime = Date.now() - startTime;
    console.log(`✅ Consulta de prueba completada en ${queryTime}ms`);
    console.log('');
    
    console.log('🎉 Base de datos funcionando correctamente!');
    console.log('');
    console.log('📊 Resumen:');
    console.log(`   - Usuarios: ${userCount}`);
    console.log(`   - Productos: ${productCount}`);
    console.log(`   - Categorías: ${categoryCount}`);
    console.log(`   - Pedidos: ${orderCount}`);
    console.log(`   - Tiempo de consulta: ${queryTime}ms`);
    
  } catch (error) {
    console.error('❌ Error verificando la base de datos:');
    console.error('   Tipo:', error.name);
    console.error('   Mensaje:', error.message);
    console.error('   Código:', error.code);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n🔧 Posibles soluciones:');
      console.error('   1. Verifica que el servidor RDS esté en estado "Available"');
      console.error('   2. Verifica que el Security Group permita conexiones desde tu IP');
      console.error('   3. Verifica que las credenciales en DATABASE_URL sean correctas');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n🔧 Posibles soluciones:');
      console.error('   1. Verifica el usuario y contraseña en DATABASE_URL');
      console.error('   2. Verifica que el usuario tenga permisos en la base de datos');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\n🔧 Posibles soluciones:');
      console.error('   1. Verifica que el nombre de la base de datos sea correcto');
      console.error('   2. Verifica que la base de datos exista');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  checkDatabaseHealth();
}

module.exports = checkDatabaseHealth;
