import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { jwtVerify } from 'jose';
import tokenBlacklist from '@/lib/token-blacklist';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

// Función para verificar autenticación y blacklist
async function verifyAuth(request) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value;
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (!accessToken && !refreshToken) {
      return { isAuthenticated: false, user: null };
    }

    // Intentar verificar access token primero
    if (accessToken) {
      try {
        const { payload } = await jwtVerify(accessToken, JWT_SECRET);
        
        // Verificar que la sesión no esté en blacklist
        if (payload.sessionId && await tokenBlacklist.isSessionBlacklisted(payload.sessionId)) {
          return { isAuthenticated: false, user: null, reason: 'session_blacklisted' };
        }
        
        return { isAuthenticated: true, user: payload };
      } catch (error) {
        // Access token inválido, continuar con refresh token
      }
    }

    // Intentar con refresh token
    if (refreshToken) {
      try {
        const { payload } = await jwtVerify(refreshToken, JWT_SECRET);
        
        // Verificar que la sesión no esté en blacklist
        if (payload.sessionId && await tokenBlacklist.isSessionBlacklisted(payload.sessionId)) {
          return { isAuthenticated: false, user: null, reason: 'session_blacklisted' };
        }
        
        return { isAuthenticated: true, user: payload };
      } catch (error) {
        return { isAuthenticated: false, user: null };
      }
    }

    return { isAuthenticated: false, user: null };
  } catch (error) {
    console.error('Error en verificación de autenticación:', error);
    return { isAuthenticated: false, user: null };
  }
}

// Función para verificar autenticación
async function verifyAuth(request) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value;
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (!accessToken && !refreshToken) {
      return { isAuthenticated: false, user: null };
    }

    // Intentar verificar access token primero
    if (accessToken) {
      try {
        const { payload } = await jwtVerify(accessToken, JWT_SECRET);
        return { isAuthenticated: true, user: payload };
      } catch (error) {
        // Access token expirado, continuar con refresh token
      }
    }

    // Si no hay access token válido, verificar refresh token
    if (refreshToken) {
      try {
        const { payload } = await jwtVerify(refreshToken, JWT_SECRET);
        return { isAuthenticated: true, user: payload };
      } catch (error) {
        return { isAuthenticated: false, user: null };
      }
    }

    return { isAuthenticated: false, user: null };
  } catch (error) {
    console.error('Error verificando autenticación:', error);
    return { isAuthenticated: false, user: null };
  }
}

// GET - Obtener items del carrito de un usuario
export async function GET(request, { params }) {
  try {
    const { userId } = await params;
    
    // Verificar autenticación
    const { isAuthenticated, user } = await verifyAuth(request);
    
    if (!isAuthenticated || !user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar que el usuario solo acceda a su propio carrito
    if (user.id !== parseInt(userId)) {
      return NextResponse.json(
        { error: 'No autorizado para acceder a este carrito' },
        { status: 403 }
      );
    }
    
    console.log('Cargando carrito para usuario:', userId);

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

    // Crear conexión
    const connection = await mysql.createConnection(connectionConfig);

    try {
      // Obtener items del carrito con información completa
      const cartQuery = `
        SELECT 
          c.id,
          c.cantidad,
          p.id as producto_id,
          p.nombre as producto_nombre,
          p.sku as producto_sku,
          p.descripcion as producto_descripcion,
          p.url_imagen as producto_imagen,
          cat.id as categoria_id,
          cat.nombre as categoria_nombre,
          col.id as color_id,
          col.nombre as color_nombre,
          col.codigo_hex as color_hex,
          s.precio,
          s.cantidad as stock_disponible
        FROM carrito c
        LEFT JOIN productos p ON c.producto_id = p.id
        LEFT JOIN categorias cat ON p.categoria_id = cat.id
        LEFT JOIN colores col ON c.color_id = col.id
        LEFT JOIN stock_detalle s ON p.id = s.producto_id AND c.color_id = s.color_id
        WHERE c.usuario_id = ?
        ORDER BY c.id ASC
      `;

      const [cartItems] = await connection.query(cartQuery, [parseInt(userId)]);
      
      console.log('Items del carrito obtenidos:', cartItems.length);

      // Formatear los items para el frontend
      const formattedItems = cartItems.map(item => {
        return {
          id: item.id,
          cantidad: item.cantidad,
          precio: item.precio || 0,
          stockDisponible: item.stock_disponible || 0,
          producto: {
            id: item.producto_id,
            nombre: item.producto_nombre,
            sku: item.producto_sku,
            descripcion: item.producto_descripcion,
            url_imagen: item.producto_imagen,
            categoria: {
              id: item.categoria_id,
              nombre: item.categoria_nombre
            }
          },
          color: {
            id: item.color_id,
            nombre: item.color_nombre,
            codigo_hex: item.color_hex
          }
        };
      });

      const response = {
        success: true,
        items: formattedItems,
        totalItems: formattedItems.length
      };

      console.log('Carrito formateado exitosamente');

      return NextResponse.json(response);

    } finally {
      await connection.end();
    }

  } catch (error) {
    console.error('❌ Error obteniendo carrito:', error);
    console.error('Stack trace:', error.stack);
    return NextResponse.json(
      { 
        error: 'Error al obtener el carrito',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// DELETE - Limpiar todo el carrito de un usuario
export async function DELETE(request, { params }) {
  try {
    const { userId } = await params;
    
    // Verificar autenticación
    const { isAuthenticated, user } = await verifyAuth(request);
    
    if (!isAuthenticated || !user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar que el usuario solo acceda a su propio carrito
    if (user.id !== parseInt(userId)) {
      return NextResponse.json(
        { error: 'No autorizado para acceder a este carrito' },
        { status: 403 }
      );
    }
    
    console.log('Limpiando carrito para usuario:', userId);

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

    // Crear conexión
    const connection = await mysql.createConnection(connectionConfig);

    try {
      // Eliminar todos los items del carrito del usuario
      const [result] = await connection.query(
        'DELETE FROM carrito WHERE usuario_id = ?',
        [parseInt(userId)]
      );

      console.log('Items eliminados del carrito:', result.affectedRows);

      return NextResponse.json({
        success: true,
        message: 'Carrito limpiado exitosamente',
        deletedItems: result.affectedRows
      });

    } finally {
      await connection.end();
    }

  } catch (error) {
    console.error('❌ Error limpiando carrito:', error);
    console.error('Stack trace:', error.stack);
    return NextResponse.json(
      { 
        error: 'Error al limpiar el carrito',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
