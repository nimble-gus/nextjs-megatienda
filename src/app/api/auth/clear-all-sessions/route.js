import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function POST(request) {
  try {
    console.log('🧹 Limpiando todas las sesiones de la base de datos');

    // Configuración de conexión
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL no está configurada');
    }

    const url = new URL(databaseUrl);
    const connectionConfig = {
      host: url.hostname,
      port: parseInt(url.port) || 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.substring(1),
      connectTimeout: 10000,
      acquireTimeout: 10000,
      timeout: 10000,
      reconnect: false
    };

    const connection = await mysql.createConnection(connectionConfig);

    try {
      // Limpiar toda la tabla session_blacklist
      const [result] = await connection.query('DELETE FROM session_blacklist');
      
      console.log(`✅ ${result.affectedRows} sesiones eliminadas de la blacklist`);

      // También limpiar otras tablas relacionadas si existen
      try {
        await connection.query('DELETE FROM failed_logins');
        console.log('✅ Tabla failed_logins limpiada');
      } catch (error) {
        console.log('Tabla failed_logins no existe o no se pudo limpiar');
      }

      try {
        await connection.query('DELETE FROM password_reset_tokens');
        console.log('✅ Tabla password_reset_tokens limpiada');
      } catch (error) {
        console.log('Tabla password_reset_tokens no existe o no se pudo limpiar');
      }

      try {
        await connection.query('DELETE FROM email_verification_tokens');
        console.log('✅ Tabla email_verification_tokens limpiada');
      } catch (error) {
        console.log('Tabla email_verification_tokens no existe o no se pudo limpiar');
      }

    } finally {
      await connection.end();
    }

    return NextResponse.json({
      success: true,
      message: 'Todas las sesiones han sido limpiadas exitosamente',
      clearedSessions: result.affectedRows
    });

  } catch (error) {
    console.error('❌ Error limpiando sesiones:', error);
    
    return NextResponse.json(
      { 
        error: 'Error al limpiar las sesiones',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
