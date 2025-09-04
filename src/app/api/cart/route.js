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

export async function GET(request) {
  try {
    console.log('🛒 [API Cart] GET request recibida');
    
    // Verificar token del cliente
    const token = request.cookies.get('clientAccessToken')?.value;
    console.log('🛒 [API Cart] Token encontrado:', token ? 'Sí' : 'No');
    
    if (!token) {
      console.log('❌ [API Cart] No hay token - retornando 401');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    console.log('🔍 [API Cart] Verificando token...');
    const decoded = await verifyClientToken(token);
    console.log('🔍 [API Cart] Token verificado:', decoded ? 'Válido' : 'Inválido');
    
    if (!decoded) {
      console.log('❌ [API Cart] Token inválido - retornando 401');
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    console.log('✅ [API Cart] Token válido para usuario:', decoded.userId);
    const userId = decoded.userId;

    // Conectar a la base de datos
    console.log('🔌 [API Cart] Conectando a la base de datos...');
    const connection = await mysql.createConnection(getConnectionConfig());

    // Obtener items del carrito con información completa
    console.log('📊 [API Cart] Consultando carrito para usuario:', userId);
    
    let rows = [];
    
    try {
      // Primero verificar si hay items en el carrito
      const [carritoRows] = await connection.execute(`
        SELECT id, producto_id, color_id, cantidad 
        FROM carrito 
        WHERE usuario_id = ?
        ORDER BY id DESC
      `, [userId]);
      
      console.log('📊 [API Cart] Items en carrito:', carritoRows.length);
      
      if (carritoRows.length === 0) {
        console.log('📊 [API Cart] Carrito vacío');
        rows = [];
      } else {
        // Obtener información completa de cada item
        const [fullRows] = await connection.execute(`
          SELECT 
            c.id,
            c.producto_id,
            c.color_id,
            c.cantidad,
            COALESCE(sd.precio, 0) as precio,
            p.nombre as producto_nombre,
            p.sku as producto_sku,
            p.url_imagen as producto_url_imagen,
            col.nombre as color_nombre,
            col.codigo_hex as color_codigo_hex
          FROM carrito c
          INNER JOIN productos p ON c.producto_id = p.id
          INNER JOIN colores col ON c.color_id = col.id
          LEFT JOIN stock_detalle sd ON c.producto_id = sd.producto_id AND c.color_id = sd.color_id
          WHERE c.usuario_id = ?
          ORDER BY c.id DESC
        `, [userId]);
        
        rows = fullRows;
      }
      
      console.log('📊 [API Cart] Consulta ejecutada exitosamente');
      console.log('📊 [API Cart] Items encontrados:', rows.length);
      
    } catch (sqlError) {
      console.error('❌ [API Cart] Error en consulta SQL:', sqlError);
      console.error('❌ [API Cart] SQL Error Code:', sqlError.code);
      console.error('❌ [API Cart] SQL Error Message:', sqlError.message);
      await connection.end();
      throw sqlError;
    }

    await connection.end();

    // Formatear la respuesta
    console.log('🔄 [API Cart] Formateando respuesta...');
    console.log('🔄 [API Cart] Rows para formatear:', rows ? rows.length : 'undefined');
    
    const items = (rows || []).map(row => {
      console.log('🔄 [API Cart] Procesando item:', row.id);
      return {
        id: row.id,
        producto_id: row.producto_id,
        color_id: row.color_id,
        cantidad: row.cantidad,
        precio: parseFloat(row.precio),
        producto: {
          id: row.producto_id,
          nombre: row.producto_nombre,
          sku: row.producto_sku,
          url_imagen: row.producto_url_imagen
        },
        color: {
          id: row.color_id,
          nombre: row.color_nombre,
          codigo_hex: row.color_codigo_hex
        }
      };
    });

    console.log('✅ [API Cart] Respuesta exitosa con', items.length, 'items');
    return NextResponse.json({ 
      success: true, 
      items,
      total: items.length
    });

  } catch (error) {
    console.error('❌ [API Cart] Error obteniendo carrito:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    );
  }
}
