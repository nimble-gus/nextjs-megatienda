import prisma from '@/lib/prisma-vercel';

export async function GET() {
  
  try {
    // Verificar si DATABASE_URL está configurada
    if (!process.env.DATABASE_URL) {
      return Response.json({
        success: false,
        error: 'DATABASE_URL no está configurada',
        envVars: {
          hasDatabaseUrl: false,
          hasJwtSecret: !!process.env.JWT_SECRET,
          hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET
        }
      }, { status: 500 });
    }

    // Intentar conexión simple
    const result = await prisma.$queryRaw`SELECT 1 as test, NOW() as timestamp`;
    
    return Response.json({
      success: true,
      message: 'Conexión a base de datos exitosa',
      data: result,
      envVars: {
        hasDatabaseUrl: true,
        databaseUrlPreview: process.env.DATABASE_URL.substring(0, 20) + '...',
        hasJwtSecret: !!process.env.JWT_SECRET,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET
      }
    });

  } catch (error) {
    return Response.json({
      success: false,
      error: error.message,
      stack: error.stack,
      envVars: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        databaseUrlPreview: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 20) + '...' : 'No configurada',
        hasJwtSecret: !!process.env.JWT_SECRET,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET
      }
    }, { status: 500 });
  }
}
