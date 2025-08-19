const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkMissingTables() {
  try {
    console.log('🔍 Verificando tablas en la base de datos...\n');

    // Lista de tablas que deberían existir según el schema
    const expectedTables = [
      'usuarios',
      'categorias', 
      'colores',
      'productos',
      'imagenes_producto',
      'stock_detalle',
      'carrito',
      'ordenes',
      'orden_detalle',
      'productos_destacados',
      'mensajes_contacto',
      'hero_images',
      'promo_banners'
    ];

    // Verificar tablas existentes
    const result = await prisma.$queryRaw`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'dbo' 
      AND TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `;

    const existingTables = result.map(row => row.TABLE_NAME);
    
    console.log('✅ Tablas existentes:');
    existingTables.forEach(table => {
      console.log(`  - ${table}`);
    });

    console.log('\n❌ Tablas faltantes:');
    const missingTables = expectedTables.filter(table => !existingTables.includes(table));
    
    if (missingTables.length === 0) {
      console.log('  ¡Todas las tablas existen! 🎉');
    } else {
      missingTables.forEach(table => {
        console.log(`  - ${table}`);
      });
    }

    console.log('\n📊 Resumen:');
    console.log(`  Total esperado: ${expectedTables.length}`);
    console.log(`  Existentes: ${existingTables.length}`);
    console.log(`  Faltantes: ${missingTables.length}`);

    // Verificar estructura de tabla ordenes
    console.log('\n🔍 Verificando estructura de tabla ordenes...');
    try {
      const ordenesStructure = await prisma.$queryRaw`
        DESCRIBE dbo.ordenes
      `;
      
      console.log('Columnas en tabla ordenes:');
      ordenesStructure.forEach(col => {
        console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
      });
    } catch (error) {
      console.log('❌ Error verificando estructura de ordenes:', error.message);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMissingTables();
