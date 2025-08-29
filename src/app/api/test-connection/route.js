import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET() {
  try {
    // Extraer información de la URL de conexión
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      return NextResponse.json({
        success: false,
        error: 'DATABASE_URL no está configurada',
        envVars: {
          hasDatabaseUrl: false
        }
      }, { status: 500 });
    }

    // Parsear la URL de conexión
    const url = new URL(databaseUrl);
    const connectionConfig = {
      host: url.hostname,
      port: parseInt(url.port) || 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.substring(1), // Remover el slash inicial
      connectTimeout: 10000,
      acquireTimeout: 10000,
      timeout: 10000,
      reconnect: false
    };

    // Intentar conexión directa
    const connection = await mysql.createConnection(connectionConfig);
    
    // Probar consulta simple
    const [rows] = await connection.execute('SELECT 1 as test, NOW() as timestamp');
    
    // Probar consulta de información de la base de datos
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ?
    `, [connectionConfig.database]);
    
    await connection.end();

    return NextResponse.json({
      success: true,
      message: 'Conexión directa a MySQL exitosa',
      data: {
        test: rows[0],
        tables: tables.map(t => t.TABLE_NAME),
        connectionInfo: {
          host: connectionConfig.host,
          port: connectionConfig.port,
          database: connectionConfig.database,
          user: connectionConfig.user
        }
      }
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage,
      databaseUrl: process.env.DATABASE_URL ? 'Configurada' : 'No configurada'
    }, { status: 500 });
  }
}
