import { jwtVerify } from 'jose';

/**
 * Verifica un token JWT del cliente
 * @param {string} token - Token JWT a verificar
 * @returns {Promise<Object|null>} - Payload del token si es válido, null si no
 */
export async function verifyClientToken(token) {
  try {
    console.log('🔍 [verifyClientToken] Iniciando verificación...');
    console.log('🔍 [verifyClientToken] Token recibido:', token ? `${token.substring(0, 20)}...` : 'null');
    
    if (!token) {
      console.log('❌ [verifyClientToken] No hay token');
      return null;
    }

    console.log('🔍 [verifyClientToken] JWT_SECRET configurado:', !!process.env.JWT_SECRET);
    console.log('🔍 [verifyClientToken] Longitud del JWT_SECRET:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);
    
    const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
    console.log('🔍 [verifyClientToken] JWT_SECRET codificado:', JWT_SECRET.length, 'bytes');

    console.log('🔍 [verifyClientToken] Intentando verificar JWT...');
    const { payload } = await jwtVerify(token, JWT_SECRET);
    console.log('🔍 [verifyClientToken] JWT verificado exitosamente');
    console.log('🔍 [verifyClientToken] Payload:', {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      exp: payload.exp,
      iat: payload.iat,
      sessionToken: payload.sessionToken ? 'Sí' : 'No',
      deviceId: payload.deviceId ? 'Sí' : 'No'
    });
    
    // Verificar que el token no haya expirado
    if (payload.exp) {
      const now = Date.now();
      const expTime = payload.exp * 1000;
      const timeUntilExpiry = expTime - now;
      
      console.log('🔍 [verifyClientToken] Tiempo actual:', new Date(now).toISOString());
      console.log('🔍 [verifyClientToken] Tiempo de expiración:', new Date(expTime).toISOString());
      console.log('🔍 [verifyClientToken] Tiempo hasta expiración:', Math.round(timeUntilExpiry / 1000), 'segundos');
      
      if (now >= expTime) {
        console.log('❌ [verifyClientToken] Token expirado');
        return null;
      }
    }

    // Verificar que sea un token de cliente
    if (payload.role !== 'cliente') {
      console.log('❌ [verifyClientToken] Token no es de cliente, role:', payload.role);
      return null;
    }

    console.log('✅ [verifyClientToken] Token válido, retornando payload');
    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      sessionToken: payload.sessionToken,
      deviceId: payload.deviceId
    };

  } catch (error) {
    console.error('❌ [verifyClientToken] Error verificando token:', error);
    console.error('❌ [verifyClientToken] Stack trace:', error.stack);
    return null;
  }
}

/**
 * Verifica un token JWT del admin
 * @param {string} token - Token JWT a verificar
 * @returns {Promise<Object|null>} - Payload del token si es válido, null si no
 */
export async function verifyAdminToken(token) {
  try {
    if (!token) {
      return null;
    }

    const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    // Verificar que el token no haya expirado
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }

    // Verificar que sea un token de admin
    if (payload.role !== 'admin') {
      return null;
    }

    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role
    };

  } catch (error) {
    console.error('Error verificando token del admin:', error);
    return null;
  }
}
