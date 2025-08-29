import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma-dataproxy';

export async function GET() {
  try {
    // Test 1: Verificar si Prisma Client se puede importar
    let prismaImport = 'Importado exitosamente';
    let prismaInstance = prisma;

    // Test 2: Verificar si Prisma Client se puede conectar
    let connectionTest = 'No intentado';
    try {
      await prismaInstance.$connect();
      connectionTest = 'Conectado exitosamente';
    } catch (error) {
      connectionTest = `Error conectando: ${error.message}`;
      await prismaInstance.$disconnect();
      return NextResponse.json({
        success: false,
        error: 'Error conectando Prisma Client',
        details: error.message,
        stack: error.stack
      }, { status: 500 });
    }

    // Test 3: Probar consulta simple con Prisma
    let queryTest = 'No intentado';
    let queryResult = null;
    try {
      queryResult = await prismaInstance.$queryRaw`SELECT 1 as test, NOW() as timestamp`;
      queryTest = 'Consulta exitosa';
    } catch (error) {
      queryTest = `Error en consulta: ${error.message}`;
      await prismaInstance.$disconnect();
      return NextResponse.json({
        success: false,
        error: 'Error en consulta Prisma',
        details: error.message,
        stack: error.stack
      }, { status: 500 });
    }

    // Test 4: Probar modelo de Prisma
    let modelTest = 'No intentado';
    let modelResult = null;
    try {
      modelResult = await prismaInstance.categorias.findMany({ take: 1 });
      modelTest = 'Modelo exitoso';
    } catch (error) {
      modelTest = `Error en modelo: ${error.message}`;
      await prismaInstance.$disconnect();
      return NextResponse.json({
        success: false,
        error: 'Error en modelo Prisma',
        details: error.message,
        stack: error.stack
      }, { status: 500 });
    }

    // Cerrar conexión
    await prismaInstance.$disconnect();

    return NextResponse.json({
      success: true,
      message: 'Prisma Client funciona correctamente',
      tests: {
        import: prismaImport,
        connection: connectionTest,
        query: queryTest,
        model: modelTest
      },
      data: {
        queryResult,
        modelResult: modelResult.length
      }
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
