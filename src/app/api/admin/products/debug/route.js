import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Verificar variables de entorno
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return NextResponse.json({
        error: 'DATABASE_URL no está configurada',
        message: 'Necesitas crear un archivo .env con DATABASE_URL="mysql://usuario:password@localhost:3306/nombre_bd"',
        example: 'DATABASE_URL="mysql://root:@localhost:3306/megatienda"'
      }, { status: 500 });
    }
    
    // Intentar conectar a la base de datos usando la instancia centralizada
    try {
      await prisma.$connect();
      // Verificar si la tabla productos existe
      const productCount = await prisma.productos.count();
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

