import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';


export async function POST(request) {
  try {
    console.log('🔄 Iniciando creación de orden...');
    
    const body = await request.json();
    console.log('📦 Datos recibidos:', JSON.stringify(body, null, 2));
    
    // Extraer datos del cliente (puede venir en formato plano o anidado)
    let cliente = body.cliente;
    let productos = body.productos;
    let metodoPago = body.metodo_pago || body.metodoPago;
    let metodoEnvio = body.metodo_envio || body.metodoEnvio;
    let costoEnvio = body.costo_envio || body.costoEnvio || 0; // Asegurar que no sea null
    let subtotal = body.subtotal;
    let total = body.total;
    let notas = body.notas;
    let usuarioId = body.usuario_id; // Extraer usuario_id si está logueado

    console.log('🔍 Valores extraídos:');
    console.log('  - costoEnvio:', costoEnvio, '(tipo:', typeof costoEnvio, ')');
    console.log('  - subtotal:', subtotal, '(tipo:', typeof subtotal, ')');
    console.log('  - total:', total, '(tipo:', typeof total, ')');
    console.log('  - metodoPago:', metodoPago, '(tipo:', typeof metodoPago, ')');
    console.log('  - usuarioId:', usuarioId, '(tipo:', typeof usuarioId, ')');
    console.log('  - Body completo usuario_id:', body.usuario_id);
    console.log('  - Body completo:', JSON.stringify(body, null, 2));
    
    // Asegurar que los valores numéricos no sean null
    if (costoEnvio === null || costoEnvio === undefined) {
      costoEnvio = 0;
    }
    if (subtotal === null || subtotal === undefined) {
      subtotal = 0;
    }
    if (total === null || total === undefined) {
      total = 0;
    }
    
    console.log('🔧 Valores después de validación:');
    console.log('  - costoEnvio:', costoEnvio);
    console.log('  - subtotal:', subtotal);
    console.log('  - total:', total);

    // Si los datos del cliente vienen en formato plano (desde WhatsAppCheckout)
    if (!cliente && body.nombre_cliente) {
      cliente = {
        nombre: body.nombre_cliente,
        email: body.email_cliente,
        telefono: body.telefono_cliente,
        direccion: body.direccion_cliente,
        ciudad: body.municipio_cliente,
        departamento: body.departamento_cliente,
        codigoPostal: body.codigo_postal_cliente,
        nit: body.nit_cliente,
        nombreQuienRecibe: body.nombre_quien_recibe
      };
    }

    // Validaciones básicas
    if (!productos || productos.length === 0) {
      console.error('❌ No hay productos en la orden');
      return NextResponse.json(
        { error: 'No hay productos en la orden' },
        { status: 400 }
      );
    }

    if (!cliente || !cliente.nombre || !cliente.email) {
      console.error('❌ Datos del cliente incompletos');
      console.error('❌ Cliente recibido:', cliente);
      return NextResponse.json(
        { error: 'Datos del cliente incompletos' },
        { status: 400 }
      );
    }

    // Configuración de conexión a MySQL
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
      reconnect: false
    };

    // Crear conexión
    const connection = await mysql.createConnection(connectionConfig);

    try {
      // Iniciar transacción
      await connection.beginTransaction();

      // Generar código de orden único
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
      const codigoOrden = `ORD-${timestamp}-${randomSuffix}`;
      
      console.log('🏷️ Código de orden generado:', codigoOrden);

      // Crear la orden en la base de datos
      console.log('💾 Creando orden en la base de datos...');
      const orderQuery = `
        INSERT INTO ordenes (
          codigo_orden, usuario_id, nombre_cliente, email_cliente, 
          telefono_cliente, direccion_cliente, municipio_cliente, 
          departamento_cliente, codigo_postal_cliente, nit_cliente, 
          nombre_quien_recibe, fecha, total, subtotal, costo_envio, 
          metodo_pago, estado, notas
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?)
      `;

      const orderParams = [
        codigoOrden, usuarioId, cliente.nombre, cliente.email,
        cliente.telefono, cliente.direccion, cliente.ciudad,
        cliente.departamento, cliente.codigoPostal, cliente.nit, 
        cliente.nombreQuienRecibe, total, subtotal, costoEnvio, 
        metodoPago, 'pendiente', notas
      ];

      const [orderResult] = await connection.query(orderQuery, orderParams);
      const ordenId = orderResult.insertId;

      console.log('✅ Orden creada con ID:', ordenId);

      // Crear los items de la orden y reducir stock
      console.log('📝 Creando items de la orden y reduciendo stock...');
      for (const producto of productos) {
        console.log('📦 Procesando producto:', producto.nombre || producto.producto?.nombre);
        
        const productoId = producto.producto_id || producto.id;
        const colorId = producto.color_id || producto.color?.id;
        const cantidad = producto.cantidad;
        
        // Verificar stock disponible antes de reducir
        console.log('🔍 Verificando stock disponible...');
        const stockQuery = `
          SELECT cantidad FROM stock_detalle 
          WHERE producto_id = ? AND color_id = ?
        `;
        
        const [stockRows] = await connection.query(stockQuery, [productoId, colorId]);
        
        if (stockRows.length === 0) {
          throw new Error(`No se encontró stock para el producto ${productoId} con color ${colorId}`);
        }
        
        const stockActual = stockRows[0].cantidad;
        console.log(`📊 Stock actual: ${stockActual}, Cantidad solicitada: ${cantidad}`);
        
        if (stockActual < cantidad) {
          throw new Error(`Stock insuficiente. Disponible: ${stockActual}, Solicitado: ${cantidad}`);
        }
        
        // Crear el detalle de la orden
        const detailQuery = `
          INSERT INTO orden_detalle (orden_id, producto_id, color_id, cantidad, precio_unitario)
          VALUES (?, ?, ?, ?, ?)
        `;
        
        await connection.query(detailQuery, [
          ordenId, productoId, colorId, 
          cantidad, producto.precio
        ]);
        
        // Reducir el stock
        console.log('📉 Reduciendo stock...');
        const updateStockQuery = `
          UPDATE stock_detalle 
          SET cantidad = cantidad - ? 
          WHERE producto_id = ? AND color_id = ?
        `;
        
        await connection.query(updateStockQuery, [cantidad, productoId, colorId]);
        
        console.log(`✅ Stock reducido: ${stockActual} → ${stockActual - cantidad}`);
      }

      // Confirmar transacción
      await connection.commit();

      console.log('✅ Orden completada exitosamente');

      return NextResponse.json({
        success: true,
        orden: {
          id: ordenId,
          codigo_orden: codigoOrden,
          total: total,
          estado: 'pendiente',
          metodo_pago: metodoPago
        }
      });

    } catch (error) {
      // Rollback en caso de error
      await connection.rollback();
      throw error;
    } finally {
      await connection.end();
    }

  } catch (error) {
    console.error('❌ Error creando orden:', error);
    console.error('❌ Stack trace:', error.stack);
    return NextResponse.json(
      { error: 'Error al crear la orden', details: error.message },
      { status: 500 }
    );
  }
}
