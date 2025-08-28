export async function GET() {
  try {
    // Verificar variables críticas
    const envCheck = {
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasJwtSecret: !!process.env.JWT_SECRET,
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
      databaseUrlLength: process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0,
      jwtSecretLength: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0,
      nextAuthUrl: process.env.NEXTAUTH_URL || 'No configurado',
      nodeEnv: process.env.NODE_ENV || 'No configurado',
      vercelEnv: process.env.VERCEL_ENV || 'No configurado'
    };

         // Intentar conexión a la base de datos
     let dbConnection = 'No intentado';
     try {
               const prisma = (await import('@/lib/prisma-simple')).default;
       
       // Intentar una consulta simple
       const result = await prisma.$queryRaw`SELECT 1 as test`;
       dbConnection = 'Conectado exitosamente';
     } catch (dbError) {
       dbConnection = `Error: ${dbError.message}`;
     }

    return Response.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: envCheck,
      databaseConnection: dbConnection,
      message: 'Diagnóstico de variables de entorno completado'
    });

  } catch (error) {
    return Response.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
