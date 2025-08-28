const { PrismaClient } = require('@prisma/client');

async function diagnosePrisma() {
  console.log('🔍 Diagnóstico de Prisma...\n');
  
  // Verificar variables de entorno
  console.log('📋 Variables de entorno:');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Configurada' : '❌ No configurada');
  console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
  console.log('');
  
  // Crear cliente Prisma
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });
  
  try {
    console.log('🔌 Intentando conectar a la base de datos...');
    
    // Test de conexión básica
    await prisma.$connect();
    console.log('✅ Conexión exitosa');
    
    // Test de query simple
    console.log('🔍 Probando query simple...');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query simple exitosa:', result);
    
    // Test de tabla productos
    console.log('📦 Probando tabla productos...');
    const productCount = await prisma.productos.count();
    console.log('✅ Productos encontrados:', productCount);
    
    // Test de tabla usuarios
    console.log('👥 Probando tabla usuarios...');
    const userCount = await prisma.usuarios.count();
    console.log('✅ Usuarios encontrados:', userCount);
    
  } catch (error) {
    console.log('❌ Error de Prisma:');
    console.log('Tipo:', error.constructor.name);
    console.log('Mensaje:', error.message);
    console.log('Código:', error.code);
    
    if (error.meta) {
      console.log('Meta:', error.meta);
    }
    
    // Verificar si es un problema de conexión
    if (error.message.includes('Engine') || error.message.includes('empty')) {
      console.log('\n🔧 Posibles soluciones:');
      console.log('1. Reiniciar el servidor de desarrollo');
      console.log('2. Verificar que la base de datos esté activa');
      console.log('3. Verificar credenciales de conexión');
      console.log('4. Ejecutar: npx prisma generate');
    }
    
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Conexión cerrada');
  }
}

diagnosePrisma().catch(console.error);
