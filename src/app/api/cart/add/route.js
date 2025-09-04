import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { verifyClientToken } from '@/lib/auth/verify-token';

// Configuración de conexión usando DATABASE_URL
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

export async function POST(request) {
  try {
    const token = request.cookies.get('clientAccessToken')?.value;
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const decoded = await verifyClientToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const userId = decoded.userId;
    const { producto_id, color_id, cantidad } = await request.json();

    if (!producto_id || !color_id || !cantidad) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
    }

    const connection = await mysql.createConnection(getConnectionConfig());

    try {
      // 1. Verificar stock disponible (incluyendo items ya en carritos)
      const [stockRows] = await connection.execute(`
        SELECT sd.cantidad as stock_total,
               COALESCE(SUM(c.cantidad), 0) as stock_en_carritos
        FROM stock_detalle sd
        LEFT JOIN carrito c ON sd.producto_id = c.producto_id 
          AND sd.color_id = c.color_id
        WHERE sd.producto_id = ? AND sd.color_id = ?
        GROUP BY sd.producto_id, sd.color_id, sd.cantidad
      `, [producto_id, color_id]);

      if (stockRows.length === 0) {
        await connection.end();
        return NextResponse.json({ error: 'Producto o color no encontrado' }, { status: 404 });
      }

      const stock = stockRows[0];
      const stockDisponible = stock.stock_total - stock.stock_en_carritos;

      if (stockDisponible < cantidad) {
        await connection.end();
        return NextResponse.json({ 
          error: 'Stock insuficiente',
          available: stockDisponible,
          requested: cantidad
        }, { status: 409 });
      }

      // 3. Obtener información del producto y color
      const [productoRows] = await connection.execute('SELECT id, nombre, sku, url_imagen FROM productos WHERE id = ?', [producto_id]);
      const [colorRows] = await connection.execute('SELECT sd.id, sd.precio, c.nombre, c.codigo_hex FROM stock_detalle sd INNER JOIN colores c ON sd.color_id = c.id WHERE sd.producto_id = ? AND sd.color_id = ?', [producto_id, color_id]);

      if (productoRows.length === 0) {
        await connection.end();
        return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
      }
      if (colorRows.length === 0) {
        await connection.end();
        return NextResponse.json({ error: 'Color no disponible para este producto' }, { status: 404 });
      }

      const producto = productoRows[0];
      const color = colorRows[0];

      // 3. Agregar al carrito
      const [existingRows] = await connection.execute('SELECT id, cantidad FROM carrito WHERE usuario_id = ? AND producto_id = ? AND color_id = ?', [userId, producto_id, color_id]);

      let itemId;
      let newCantidad;

      if (existingRows.length > 0) {
        const existingItem = existingRows[0];
        newCantidad = existingItem.cantidad + parseInt(cantidad);
        await connection.execute('UPDATE carrito SET cantidad = ? WHERE id = ?', [newCantidad, existingItem.id]);
        itemId = existingItem.id;
      } else {
        const [result] = await connection.execute('INSERT INTO carrito (usuario_id, producto_id, color_id, cantidad) VALUES (?, ?, ?, ?)', [userId, producto_id, color_id, cantidad]);
        itemId = result.insertId;
        newCantidad = parseInt(cantidad);
      }

      await connection.end();

      const newItem = {
        id: itemId,
        producto_id: producto_id,
        color_id: color_id,
        cantidad: newCantidad,
        precio: parseFloat(color.precio),
        producto: {
          id: producto.id,
          nombre: producto.nombre,
          sku: producto.sku,
          url_imagen: producto.url_imagen
        },
        color: {
          id: color.id,
          nombre: color.nombre,
          codigo_hex: color.codigo_hex
        }
      };

      return NextResponse.json({ 
        success: true, 
        message: 'Item agregado al carrito', 
        item: newItem
      });

    } catch (sqlError) {
      console.error('Error en SQL al agregar al carrito:', sqlError);
      await connection.end();
      throw sqlError;
    }

  } catch (error) {
    console.error('Error agregando al carrito:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
