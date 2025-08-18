import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('=== DEBUG API /api/admin/products/debug ===');
    
    // Verificar variables de entorno
    const databaseUrl = process.env.DATABASE_URL;
    console.log('DATABASE_URL configurada:', databaseUrl ? 'Sí' : 'No');
    
    if (!databaseUrl) {
      return NextResponse.json({
        error: 'DATABASE_URL no está configurada',
        message: 'Necesitas crear un archivo .env con DATABASE_URL="mysql://usuario:password@localhost:3306/nombre_bd"',
        example: 'DATABASE_URL="mysql://root:@localhost:3306/megatienda"'
      }, { status: 500 });
    }
    
    // Intentar importar Prisma
    let PrismaClient;
    try {
      const prismaModule = await import('@prisma/client');
      PrismaClient = prismaModule.PrismaClient;
      console.log('✅ Prisma Client importado correctamente');
    } catch (prismaError) {
      console.error('❌ Error importando Prisma Client:', prismaError);
      return NextResponse.json({
        error: 'Error con Prisma Client',
        details: prismaError.message,
        solution: 'Ejecuta: npx prisma generate'
      }, { status: 500 });
    }
    
    // Intentar conectar a la base de datos
    const prisma = new PrismaClient();
    try {
      await prisma.$connect();
      console.log('✅ Conexión a la base de datos exitosa');
      
      // Verificar si la tabla productos existe
      const productCount = await prisma.productos.count();
      console.log(`📊 Productos en la tabla: ${productCount}`);
      
      await prisma.$disconnect();
      
      return NextResponse.json({
        status: 'success',
        message: 'Conexión a la base de datos exitosa',
        productCount: productCount,
        databaseUrl: databaseUrl.replace(/\/\/.*@/, '//***:***@') // Ocultar credenciales
      });
      
    } catch (dbError) {
      console.error('❌ Error de conexión a la base de datos:', dbError);
      await prisma.$disconnect();
      
      return NextResponse.json({
        error: 'Error de conexión a la base de datos',
        details: dbError.message,
        possibleSolutions: [
          'Verifica que MySQL esté ejecutándose',
          'Verifica las credenciales en DATABASE_URL',
          'Verifica que la base de datos exista',
          'Verifica que el puerto sea correcto (3306)'
        ]
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Error en debug API:', error);
    return NextResponse.json({
      error: 'Error inesperado',
      details: error.message
    }, { status: 500 });
  }
}


