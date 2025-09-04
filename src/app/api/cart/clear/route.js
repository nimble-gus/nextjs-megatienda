import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { verifyClientToken } from '@/lib/auth/verify-token';

// Configuración de conexión usando DATABASE_URL
const getConnectionConfig = () => {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL no está configurada');
  }

  const url = new URL(databaseUrl);
  return {
    host: url.hostname,
    port: parseInt(url.port) || 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.substring(1),
    // Configuración válida para createConnection
    connectTimeout: 60000,
    // Configuraciones adicionales para estabilidad
    supportBigNumbers: true,
    bigNumberStrings: true,
    dateStrings: false,
    debug: false,
    trace: false,
    multipleStatements: false
  };
};

export async function DELETE(request) {
  try {
    // Verificar token del cliente
    const token = request.cookies.get('clientAccessToken')?.value;
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const decoded = await verifyClientToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const userId = decoded.userId;

    // Conectar a la base de datos
    const connection = await mysql.createConnection(getConnectionConfig());

    // Limpiar todos los items del carrito del usuario
    await connection.execute(
      'DELETE FROM carrito WHERE usuario_id = ?',
      [userId]
    );

    await connection.end();

    return NextResponse.json({ 
      success: true, 
      message: 'Carrito limpiado exitosamente'
    });

  } catch (error) {
    console.error('Error limpiando carrito:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    );
  }
}
