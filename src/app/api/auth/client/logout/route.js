import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { executeQuery } from '@/lib/mysql-direct';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function POST(request) {
  try {
    console.log('🔄 Iniciando logout del cliente...');
    
    // Obtener tokens y device ID
    const clientAccessToken = request.cookies.get('clientAccessToken')?.value;
    const clientDeviceId = request.cookies.get('clientDeviceId')?.value;
    
    console.log('📱 Tokens encontrados:', {
      hasAccessToken: !!clientAccessToken,
      hasDeviceId: !!clientDeviceId,
      deviceId: clientDeviceId
    });
    
    // Si hay access token, intentar extraer información para invalidar la sesión
    if (clientAccessToken && clientDeviceId) {
      try {
        const { payload } = await jwtVerify(clientAccessToken, JWT_SECRET);
        
        console.log('🔍 Payload del token:', {
          userId: payload.userId,
          sessionToken: payload.sessionToken,
          deviceId: payload.deviceId
        });
        
        if (payload.sessionToken && payload.deviceId) {
          // Invalidar la sesión específica en la base de datos
          const invalidateSessionQuery = `
            UPDATE sesiones_clientes 
            SET is_active = false 
            WHERE session_token = ? AND device_id = ? AND is_active = true
          `;
          
          console.log('🗄️ Ejecutando query de invalidación...');
          const result = await executeQuery(invalidateSessionQuery, [
            payload.sessionToken, 
            payload.deviceId
          ]);
          
          console.log('📊 Resultado de invalidación:', {
            affectedRows: result.affectedRows,
            message: result.message || 'N/A'
          });
          
          if (result.affectedRows > 0) {
            console.log(`✅ Sesión invalidada para dispositivo ${payload.deviceId}`);
          } else {
            console.log(`⚠️ No se encontró sesión activa para invalidar`);
            
            // Verificar qué sesiones existen para este dispositivo
            const checkSessionsQuery = `
              SELECT id, session_token, is_active, created_at, expires_at
              FROM sesiones_clientes 
              WHERE device_id = ? AND usuario_id = ?
            `;
            
            const sessions = await executeQuery(checkSessionsQuery, [
              payload.deviceId, 
              payload.userId
            ]);
            
            console.log('🔍 Sesiones encontradas para este dispositivo:', sessions);
          }
        } else {
          console.log('⚠️ Token no contiene sessionToken o deviceId');
        }
      } catch (error) {
        console.warn('⚠️ Error verificando access token durante logout:', error.message);
      }
    } else {
      console.log('⚠️ No se encontraron tokens para invalidar sesión');
    }
    
    // Crear respuesta de éxito
    const response = NextResponse.json({
      success: true,
      message: 'Logout exitoso'
    });

    // Limpiar cookies del cliente de manera más agresiva
    console.log('🍪 Limpiando cookies...');
    
    response.cookies.set('clientAccessToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(0), // Expirar en el pasado
      path: '/',
      domain: undefined // Asegurar que se aplique al dominio actual
    });

    response.cookies.set('clientRefreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(0), // Expirar en el pasado
      path: '/',
      domain: undefined // Asegurar que se aplique al dominio actual
    });

    response.cookies.set('clientDeviceId', '', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(0), // Expirar en el pasado
      path: '/',
      domain: undefined // Asegurar que se aplique al dominio actual
    });

    // También limpiar con maxAge negativo como respaldo
    response.cookies.set('clientAccessToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: -1, // Valor negativo para forzar expiración
      path: '/'
    });

    response.cookies.set('clientRefreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: -1, // Valor negativo para forzar expiración
      path: '/'
    });

    response.cookies.set('clientDeviceId', '', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: -1, // Valor negativo para forzar expiración
      path: '/'
    });

    console.log('✅ Cookies limpiadas exitosamente');
    console.log('🎯 Logout completado - sesión invalidada y cookies limpias');
    
    return response;

  } catch (error) {
    console.error('❌ Error en logout del cliente:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
