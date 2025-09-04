import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { SignJWT } from 'jose';
import { executeQuery } from '@/lib/mysql-direct';
import { generateDeviceId, generateSessionToken } from '@/utils/device-utils';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function POST(request) {
  console.log('🚀 [LOGIN] Endpoint POST llamado');
  
  try {
    console.log('🔄 [LOGIN] Iniciando proceso de login...');
    
    console.log('📥 [LOGIN] Parseando request body...');
    const { email, password, deviceId, deviceInfo } = await request.json();
    console.log('📱 [LOGIN] Datos recibidos:', { email, hasPassword: !!password, deviceId, hasDeviceInfo: !!deviceInfo });

    // Validar campos requeridos
    if (!email || !password) {
      console.log('❌ [LOGIN] Campos requeridos faltantes');
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    console.log('🔍 [LOGIN] Buscando usuario en la base de datos...');
    
    // Buscar usuario por email
    const userQuery = `
      SELECT id, nombre, correo, contraseña as password, rol
      FROM usuarios
      WHERE correo = ? AND rol = 'cliente'
    `;
    
    const userResult = await executeQuery(userQuery, [email]);
    console.log('🗄️ [LOGIN] Resultado de búsqueda de usuario:', {
      found: !!userResult && userResult.length > 0,
      count: userResult?.length || 0
    });
    
    if (!userResult || userResult.length === 0) {
      console.log('❌ [LOGIN] Usuario no encontrado');
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }
    
    const user = userResult[0];
    console.log('✅ [LOGIN] Usuario encontrado:', { id: user.id, nombre: user.nombre, rol: user.rol });

    // Verificar contraseña
    console.log('🔐 [LOGIN] Verificando contraseña...');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('🔐 [LOGIN] Contraseña válida:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('❌ [LOGIN] Contraseña incorrecta');
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Generar ID único del dispositivo si no se proporciona
    const finalDeviceId = deviceId || generateDeviceId();
    console.log('📱 [LOGIN] Device ID final:', finalDeviceId);
    
    // Generar token de sesión único
    const sessionToken = generateSessionToken();
    console.log('🎫 [LOGIN] Session token generado:', sessionToken);
    
    // Obtener IP del cliente
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    console.log('🌐 [LOGIN] IP del cliente:', ipAddress);
    
    // Obtener User Agent
    const userAgent = request.headers.get('user-agent') || 'unknown';
    console.log('📱 [LOGIN] User Agent:', userAgent.substring(0, 100) + '...');

    console.log('🗄️ [LOGIN] Invalidando sesiones anteriores...');
    
    // Invalidar sesiones anteriores del mismo dispositivo
    const invalidatePreviousSessions = `
      UPDATE sesiones_clientes 
      SET is_active = false 
      WHERE usuario_id = ? AND device_id = ? AND is_active = true
    `;
    
    try {
      const invalidateResult = await executeQuery(invalidatePreviousSessions, [user.id, finalDeviceId]);
      console.log('🗄️ [LOGIN] Resultado de invalidación:', {
        affectedRows: invalidateResult.affectedRows,
        message: invalidateResult.message || 'N/A'
      });
    } catch (error) {
      console.error('❌ [LOGIN] Error invalidando sesiones anteriores:', error);
      // Continuar aunque falle la invalidación
    }

    console.log('🗄️ [LOGIN] Creando nueva sesión en la base de datos...');
    
    // Crear nueva sesión en la base de datos
    const createSessionQuery = `
      INSERT INTO sesiones_clientes (
        usuario_id, session_token, device_id, device_info, 
        ip_address, user_agent, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))
    `;
    
    try {
      const createSessionResult = await executeQuery(createSessionQuery, [
        user.id,
        sessionToken,
        finalDeviceId,
        JSON.stringify(deviceInfo || {}),
        ipAddress,
        userAgent
      ]);
      
      console.log('🗄️ [LOGIN] Resultado de creación de sesión:', {
        insertId: createSessionResult.insertId,
        affectedRows: createSessionResult.affectedRows,
        message: createSessionResult.message || 'N/A'
      });
    } catch (error) {
      console.error('❌ [LOGIN] Error creando sesión en la base de datos:', error);
      throw error; // Re-lanzar el error para que se maneje arriba
    }

    console.log('🔑 [LOGIN] Generando tokens JWT...');
    
    // Generar tokens JWT con información del dispositivo
    const accessToken = await new SignJWT({
      userId: user.id,
      email: user.correo,
      role: user.rol, // Cambiado de 'rol' a 'role' para consistencia
      nombre: user.nombre,
      sessionToken: sessionToken,
      deviceId: finalDeviceId
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(JWT_SECRET);

    const refreshToken = await new SignJWT({
      userId: user.id,
      email: user.correo,
      role: user.rol, // Cambiado de 'rol' a 'role' para consistencia
      sessionToken: sessionToken,
      deviceId: finalDeviceId
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    console.log('🍪 [LOGIN] Configurando cookies...');

    // Crear respuesta con cookies HttpOnly
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        rol: user.rol
      },
      deviceId: finalDeviceId,
      message: 'Login exitoso'
    });

    // Configurar cookies HttpOnly específicas para cliente
    response.cookies.set('clientAccessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 horas
      path: '/'
    });

    response.cookies.set('clientRefreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 días
      path: '/'
    });

    // Cookie adicional para el device ID (no HttpOnly para acceso del cliente)
    response.cookies.set('clientDeviceId', finalDeviceId, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 días
      path: '/'
    });

    console.log(`✅ [LOGIN] Login exitoso para usuario ${user.nombre} en dispositivo ${finalDeviceId}`);

    return response;

  } catch (error) {
    console.error('❌ [LOGIN] Error en el proceso de login:', error);
    console.error('❌ [LOGIN] Stack trace:', error.stack);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
