import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { executeQuery } from '@/lib/mysql-direct';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function GET(request) {
  console.log('🚀 [STATUS] Endpoint GET llamado');
  
  try {
    console.log('🔍 [STATUS] Verificando estado de autenticación del cliente...');
    
    // Obtener tokens del cliente
    const clientAccessToken = request.cookies.get('clientAccessToken')?.value;
    const clientRefreshToken = request.cookies.get('clientRefreshToken')?.value;
    const clientDeviceId = request.cookies.get('clientDeviceId')?.value;
    
    console.log('📱 [STATUS] Tokens encontrados:', {
      hasAccessToken: !!clientAccessToken,
      hasRefreshToken: !!clientRefreshToken,
      hasDeviceId: !!clientDeviceId,
      deviceId: clientDeviceId,
      accessTokenLength: clientAccessToken?.length || 0,
      refreshTokenLength: clientRefreshToken?.length || 0
    });

    let tokenValid = false;
    let userData = null;

    // Verificar access token primero
    if (clientAccessToken) {
      try {
        const { payload } = await jwtVerify(clientAccessToken, JWT_SECRET);
        console.log('🔑 [STATUS] Access token válido:', {
          userId: payload.userId,
          sessionToken: payload.sessionToken,
          deviceId: payload.deviceId,
          rol: payload.rol,
          nombre: payload.nombre
        });
        
        // Verificar que la sesión esté activa en la base de datos
        if (payload.sessionToken && payload.deviceId) {
          console.log('🗄️ [STATUS] Buscando sesión en BD:', {
            sessionToken: payload.sessionToken,
            deviceId: payload.deviceId
          });
          
          const sessionQuery = `
            SELECT s.id, s.is_active, s.expires_at, u.id as user_id, u.nombre, u.correo, u.rol, u.creado_en
            FROM sesiones_clientes s
            JOIN usuarios u ON s.usuario_id = u.id
            WHERE s.session_token = ? AND s.device_id = ? AND s.is_active = true
          `;
          
          const sessionResult = await executeQuery(sessionQuery, [payload.sessionToken, payload.deviceId]);
          console.log('🗄️ [STATUS] Resultado de verificación de sesión:', {
            found: !!sessionResult && sessionResult.length > 0,
            count: sessionResult?.length || 0,
            session: sessionResult?.[0] || null
          });
          
          if (sessionResult && sessionResult.length > 0) {
            const session = sessionResult[0];
            
            // Verificar que la sesión no haya expirado
            const now = new Date();
            const expiresAt = new Date(session.expires_at);
            const isExpired = expiresAt <= now;
            
            console.log('⏰ [STATUS] Verificación de expiración:', {
              now: now.toISOString(),
              expiresAt: expiresAt.toISOString(),
              isExpired: isExpired,
              timeDifference: expiresAt.getTime() - now.getTime()
            });
            
            if (!isExpired) {
              userData = {
                id: session.user_id,
                nombre: session.nombre,
                correo: session.correo,
                rol: session.rol,
                creado_en: session.creado_en
              };
              tokenValid = true;
              console.log('✅ [STATUS] Sesión válida y activa para usuario:', userData.nombre);
            } else {
              console.log('⏰ [STATUS] Sesión expirada, marcando como inactiva');
              // Marcar sesión como inactiva
              await executeQuery(
                'UPDATE sesiones_clientes SET is_active = false WHERE id = ?',
                [session.id]
              );
            }
          } else {
            console.log('❌ [STATUS] Sesión no encontrada o inactiva en la base de datos');
            
            // Verificar si existe la sesión pero está inactiva
            const inactiveSessionQuery = `
              SELECT s.id, s.is_active, s.expires_at, s.session_token, s.device_id
              FROM sesiones_clientes s
              WHERE s.session_token = ? AND s.device_id = ?
            `;
            
            const inactiveSession = await executeQuery(inactiveSessionQuery, [payload.sessionToken, payload.deviceId]);
            console.log('🔍 [STATUS] Verificando sesión inactiva:', {
              found: !!inactiveSession && inactiveSession.length > 0,
              session: inactiveSession?.[0] || null
            });
          }
        } else {
          console.log('⚠️ [STATUS] Token no contiene sessionToken o deviceId');
        }
      } catch (error) {
        console.log('❌ [STATUS] Access token inválido:', error.message);
      }
    }

    // Si el access token no es válido, intentar con el refresh token
    if (!tokenValid && clientRefreshToken) {
      try {
        const { payload } = await jwtVerify(clientRefreshToken, JWT_SECRET);
        console.log('🔄 [STATUS] Refresh token válido:', {
          userId: payload.userId,
          sessionToken: payload.sessionToken,
          deviceId: payload.deviceId,
          rol: payload.rol
        });
        
        // Verificar que el token sea para un cliente
        if (payload.rol === 'cliente') {
          // Verificar que la sesión esté activa en la base de datos
          if (payload.sessionToken && payload.deviceId) {
            const sessionQuery = `
              SELECT s.id, s.is_active, s.expires_at, u.id as user_id, u.nombre, u.correo, u.rol, u.creado_en
              FROM sesiones_clientes s
              JOIN usuarios u ON s.usuario_id = u.id
              WHERE s.session_token = ? AND s.device_id = ? AND s.is_active = true
            `;
            
            const sessionResult = await executeQuery(sessionQuery, [payload.sessionToken, payload.deviceId]);
            console.log('🗄️ [STATUS] Resultado de verificación de sesión (refresh):', {
              found: !!sessionResult && sessionResult.length > 0,
              count: sessionResult?.length || 0,
              session: sessionResult?.[0] || null
            });
            
            if (sessionResult && sessionResult.length > 0) {
              const session = sessionResult[0];
              
              // Verificar que la sesión no haya expirado
              const now = new Date();
              const expiresAt = new Date(session.expires_at);
              const isExpired = expiresAt <= now;
              
              console.log('⏰ [STATUS] Verificación de expiración (refresh):', {
                now: now.toISOString(),
                expiresAt: expiresAt.toISOString(),
                isExpired: isExpired
              });
              
              if (!isExpired) {
                userData = {
                  id: session.user_id,
                  nombre: session.nombre,
                  correo: session.correo,
                  rol: session.rol,
                  creado_en: session.creado_en
                };
                tokenValid = true;
                
                // Si el refresh token es válido pero el access token no, indicar que se necesita refresh
                if (!clientAccessToken) {
                  console.log('🔄 [STATUS] Indicando que se necesita refresh del access token');
                  return NextResponse.json({
                    isAuthenticated: true,
                    user: userData,
                    needsRefresh: true
                  });
                }
              } else {
                console.log('⏰ [STATUS] Sesión expirada (refresh), marcando como inactiva');
                // Marcar sesión como inactiva
                await executeQuery(
                  'UPDATE sesiones_clientes SET is_active = false WHERE id = ?',
                  [session.id]
                );
              }
            } else {
              console.log('❌ [STATUS] Sesión no encontrada o inactiva (refresh)');
            }
          }
        }
      } catch (error) {
        console.log('❌ [STATUS] Refresh token inválido:', error.message);
      }
    }

    if (tokenValid && userData) {
      console.log('✅ [STATUS] Usuario autenticado:', userData.nombre);
      return NextResponse.json({
        isAuthenticated: true,
        user: userData
      });
    } else {
      console.log('❌ [STATUS] Usuario no autenticado');
      return NextResponse.json({
        isAuthenticated: false,
        user: null
      });
    }

  } catch (error) {
    console.error('❌ [STATUS] Error verificando estado de autenticación del cliente:', error);
    return NextResponse.json({
      isAuthenticated: false,
      user: null
    });
  }
}
