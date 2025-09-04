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
    connectTimeout: 60000,
    supportBigNumbers: true,
    bigNumberStrings: true,
    dateStrings: false,
    debug: false,
    trace: false,
    multipleStatements: false
  };
};

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
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

    // Verificar que el item pertenece al usuario
    const [itemRows] = await connection.execute(
      'SELECT id FROM carrito WHERE id = ? AND usuario_id = ?',
      [id, userId]
    );

    if (itemRows.length === 0) {
      await connection.end();
      return NextResponse.json(
        { error: 'Item no encontrado o no autorizado' }, 
        { status: 404 }
      );
    }

    // Eliminar el item del carrito
    await connection.execute(
      'DELETE FROM carrito WHERE id = ?',
      [id]
    );

    await connection.end();

    return NextResponse.json({ 
      success: true, 
      message: 'Item removido del carrito',
      itemId: parseInt(id)
    });

  } catch (error) {
    console.error('Error removiendo item:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    );
  }
}
