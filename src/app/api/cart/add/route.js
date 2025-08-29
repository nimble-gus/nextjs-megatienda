import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

// POST - Agregar producto al carrito
export async function POST(request) {
  try {
    // Verificar autenticación desde cookies o Authorization header
    let accessToken = request.cookies.get('accessToken')?.value;
    
    // Si no hay token en cookies, verificar Authorization header
    if (!accessToken) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        accessToken = authHeader.substring(7);
      }
    }
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Token de autenticación requerido' },
        { status: 401 }
      );
    }

    let decoded;
    
    try {
      const { payload } = await jwtVerify(accessToken, JWT_SECRET);
      decoded = payload;
    } catch (error) {
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 401 }
      );
    }

    const { usuario_id, producto_id, color_id, cantidad } = await request.json();
    
    // Validar que el usuario del token coincida con el usuario_id enviado
    if (decoded.id !== parseInt(usuario_id)) {
      return NextResponse.json(
        { error: 'No autorizado para modificar este carrito' },
        { status: 403 }
      );
    }

    // Validaciones
    if (!usuario_id || !producto_id || !color_id || !cantidad) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    if (cantidad < 1) {
      return NextResponse.json(
        { error: 'La cantidad debe ser mayor a 0' },
        { status: 400 }
      );
    }

    console.log('Agregando al carrito:', { usuario_id, producto_id, color_id, cantidad });

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
      // Verificar si el producto existe y tiene stock
      const stockQuery = `
        SELECT id, cantidad, precio 
        FROM stock_detalle 
        WHERE producto_id = ? AND color_id = ?
      `;
      
      const [stockItems] = await connection.query(stockQuery, [parseInt(producto_id), parseInt(color_id)]);

      if (stockItems.length === 0) {
        return NextResponse.json(
          { error: 'Producto o color no disponible' },
          { status: 404 }
        );
      }

      const stockItem = stockItems[0];

      if (stockItem.cantidad < cantidad) {
        return NextResponse.json(
          { error: 'Stock insuficiente' },
          { status: 400 }
        );
      }

      // Verificar si ya existe el item en el carrito
      const existingCartQuery = `
        SELECT id, cantidad 
        FROM carrito 
        WHERE usuario_id = ? AND producto_id = ? AND color_id = ?
      `;
      
      const [existingCartItems] = await connection.query(existingCartQuery, [
        parseInt(usuario_id), 
        parseInt(producto_id), 
        parseInt(color_id)
      ]);

      let cartItem;
      let isUpdate = false;

      if (existingCartItems.length > 0) {
        // Actualizar cantidad si ya existe
        const existingCartItem = existingCartItems[0];
        const newQuantity = existingCartItem.cantidad + cantidad;
        
        if (stockItem.cantidad < newQuantity) {
          return NextResponse.json(
            { error: 'Stock insuficiente para la cantidad solicitada' },
            { status: 400 }
          );
        }

        const updateQuery = `
          UPDATE carrito 
          SET cantidad = ? 
          WHERE id = ?
        `;
        
        await connection.query(updateQuery, [newQuantity, existingCartItem.id]);
        
        cartItem = {
          id: existingCartItem.id,
          cantidad: newQuantity
        };
        isUpdate = true;
      } else {
        // Crear nuevo item en el carrito
        const insertQuery = `
          INSERT INTO carrito (usuario_id, producto_id, color_id, cantidad)
          VALUES (?, ?, ?, ?)
        `;
        
        const [insertResult] = await connection.query(insertQuery, [
          parseInt(usuario_id),
          parseInt(producto_id),
          parseInt(color_id),
          parseInt(cantidad)
        ]);
        
        cartItem = {
          id: insertResult.insertId,
          cantidad: parseInt(cantidad)
        };
      }

      // Obtener información completa del item del carrito
      const cartItemQuery = `
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
          s.precio
        FROM carrito c
        LEFT JOIN productos p ON c.producto_id = p.id
        LEFT JOIN categorias cat ON p.categoria_id = cat.id
        LEFT JOIN colores col ON c.color_id = col.id
        LEFT JOIN stock_detalle s ON p.id = s.producto_id AND c.color_id = s.color_id
        WHERE c.id = ?
      `;
      
      const [cartItemDetails] = await connection.query(cartItemQuery, [cartItem.id]);

      if (cartItemDetails.length === 0) {
        throw new Error('Error obteniendo detalles del carrito');
      }

      const itemDetail = cartItemDetails[0];

      // Formatear la respuesta
      const formattedItem = {
        id: itemDetail.id,
        cantidad: itemDetail.cantidad,
        precio: itemDetail.precio,
        producto: {
          id: itemDetail.producto_id,
          nombre: itemDetail.producto_nombre,
          sku: itemDetail.producto_sku,
          descripcion: itemDetail.producto_descripcion,
          url_imagen: itemDetail.producto_imagen,
          categoria: {
            id: itemDetail.categoria_id,
            nombre: itemDetail.categoria_nombre
          }
        },
        color: {
          id: itemDetail.color_id,
          nombre: itemDetail.color_nombre,
          codigo_hex: itemDetail.color_hex
        }
      };

      console.log('Producto agregado/actualizado en el carrito exitosamente');

      return NextResponse.json({
        success: true,
        message: isUpdate ? 'Cantidad actualizada en el carrito' : 'Producto agregado al carrito',
        item: formattedItem
      });

    } finally {
      await connection.end();
    }

  } catch (error) {
    console.error('❌ Error agregando al carrito:', error);
    console.error('Stack trace:', error.stack);
    return NextResponse.json(
      { 
        error: 'Error al agregar al carrito',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
