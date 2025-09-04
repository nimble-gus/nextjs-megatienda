import { NextResponse } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';
import { executeQuery } from '@/lib/mysql-direct';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function POST(request) {
  try {
    // Obtener el refresh token del cliente
    const clientRefreshToken = request.cookies.get('clientRefreshToken')?.value;
    const clientDeviceId = request.cookies.get('clientDeviceId')?.value;

    if (!clientRefreshToken) {
      return NextResponse.json(
        { error: 'Refresh token no encontrado' },
        { status: 401 }
      );
    }

    if (!clientDeviceId) {
      return NextResponse.json(
        { error: 'Device ID no encontrado' },
        { status: 401 }
      );
    }

    // Verificar el refresh token
    let payload;
    try {
      const { payload: verifiedPayload } = await jwtVerify(clientRefreshToken, JWT_SECRET);
      payload = verifiedPayload;
    } catch (error) {
      return NextResponse.json(
        { error: 'Refresh token inválido' },
        { status: 401 }
      );
    }

    // Verificar que el token sea para un cliente
    if (payload.rol !== 'cliente') {
      return NextResponse.json(
        { error: 'Token inválido para cliente' },
        { status: 403 }
      );
    }

    // Verificar que el device ID coincida
    if (payload.deviceId !== clientDeviceId) {
      console.warn(`⚠️ Device ID mismatch: token=${payload.deviceId}, cookie=${clientDeviceId}`);
      return NextResponse.json(
        { error: 'Dispositivo no autorizado' },
        { status: 403 }
      );
    }

    // Verificar que la sesión esté activa en la base de datos
    const sessionQuery = `
      SELECT s.id, s.is_active, s.expires_at, u.id as user_id, u.nombre, u.correo, u.rol, u.creado_en
      FROM sesiones_clientes s
      JOIN usuarios u ON s.usuario_id = u.id
      WHERE s.session_token = ? AND s.device_id = ? AND s.is_active = true
    `;
    
    const sessionResult = await executeQuery(sessionQuery, [payload.sessionToken, payload.deviceId]);
    
    if (!sessionResult || sessionResult.length === 0) {
      console.warn(`⚠️ Sesión no encontrada o inactiva: ${payload.sessionToken}`);
      return NextResponse.json(
        { error: 'Sesión no válida' },
        { status: 401 }
      );
    }

    const session = sessionResult[0];
    const user = {
      id: session.user_id,
      nombre: session.nombre,
      correo: session.correo,
      rol: session.rol,
      creado_en: session.creado_en
    };

    // Verificar que la sesión no haya expirado
    if (new Date(session.expires_at) < new Date()) {
      console.warn(`⚠️ Sesión expirada: ${payload.sessionToken}`);
      
      // Marcar sesión como inactiva
      await executeQuery(
        'UPDATE sesiones_clientes SET is_active = false WHERE id = ?',
        [session.id]
      );
      
      return NextResponse.json(
        { error: 'Sesión expirada' },
        { status: 401 }
      );
    }

    // Actualizar última actividad de la sesión
    await executeQuery(
      'UPDATE sesiones_clientes SET last_activity = NOW() WHERE id = ?',
      [session.id]
    );

    // Generar nuevos tokens
    const newAccessToken = await new SignJWT({
      userId: user.id,
      email: user.correo,
      role: user.rol, // Cambiado de 'rol' a 'role' para consistencia
      nombre: user.nombre,
      sessionToken: payload.sessionToken,
      deviceId: payload.deviceId
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(JWT_SECRET);

    const newRefreshToken = await new SignJWT({
      userId: user.id,
      email: user.correo,
      role: user.rol, // Cambiado de 'rol' a 'role' para consistencia
      sessionToken: payload.sessionToken,
      deviceId: payload.deviceId
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    // Crear respuesta con nuevos tokens
    const response = NextResponse.json({
      success: true,
      user: user,
      message: 'Tokens renovados exitosamente'
    });

    // Configurar nuevas cookies HttpOnly
    response.cookies.set('clientAccessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 horas
      path: '/'
    });

    response.cookies.set('clientRefreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 días
      path: '/'
    });

    console.log(`✅ Tokens renovados para usuario ${user.nombre} en dispositivo ${payload.deviceId}`);

    return response;

  } catch (error) {
    console.error('Error renovando tokens del cliente:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
