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

export async function PUT(request, { params }) {
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
    const { cantidad } = await request.json();

    // Validar datos requeridos
    if (!cantidad || cantidad < 1) {
      return NextResponse.json(
        { error: 'La cantidad debe ser mayor a 0' }, 
        { status: 400 }
      );
    }

    // Conectar a la base de datos
    const connection = await mysql.createConnection(getConnectionConfig());

    // Verificar que el item pertenece al usuario y obtener información
    const [itemRows] = await connection.execute(
      'SELECT id, producto_id, color_id, cantidad as cantidad_actual FROM carrito WHERE id = ? AND usuario_id = ?',
      [id, userId]
    );

    if (itemRows.length === 0) {
      await connection.end();
      return NextResponse.json(
        { error: 'Item no encontrado o no autorizado' }, 
        { status: 404 }
      );
    }

    const item = itemRows[0];
    const diferenciaCantidad = cantidad - item.cantidad_actual;

    // Si se está aumentando la cantidad, verificar stock disponible
    if (diferenciaCantidad > 0) {
      const [stockRows] = await connection.execute(`
        SELECT sd.cantidad as stock_total,
               COALESCE(SUM(c.cantidad), 0) as stock_en_carritos
        FROM stock_detalle sd
        LEFT JOIN carrito c ON sd.producto_id = c.producto_id 
          AND sd.color_id = c.color_id
        WHERE sd.producto_id = ? AND sd.color_id = ?
        GROUP BY sd.producto_id, sd.color_id, sd.cantidad
      `, [item.producto_id, item.color_id]);

      if (stockRows.length > 0) {
        const stock = stockRows[0];
        const stockDisponible = stock.stock_total - stock.stock_en_carritos + item.cantidad_actual;

        if (stockDisponible < cantidad) {
          await connection.end();
          return NextResponse.json({ 
            error: 'Stock insuficiente',
            available: stockDisponible,
            requested: cantidad
          }, { status: 409 });
        }
      }
    }

    // Actualizar la cantidad
    await connection.execute(
      'UPDATE carrito SET cantidad = ? WHERE id = ?',
      [cantidad, id]
    );

    await connection.end();

    return NextResponse.json({ 
      success: true, 
      message: 'Cantidad actualizada',
      itemId: parseInt(id),
      cantidad: parseInt(cantidad)
    });

  } catch (error) {
    console.error('Error actualizando cantidad:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    );
  }
}
