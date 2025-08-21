import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Configuración de seguridad
const SECURITY_CONFIG = {
  // Rutas que requieren autenticación
  PROTECTED_ROUTES: [
    '/orders',
    '/cart',
    '/checkout',
    '/admin',
    '/api/cart',
    '/api/orders'
  ],
  
  // Rutas que requieren rol de administrador
  ADMIN_ROUTES: [
    '/admin'
  ],
  
  // Rutas públicas (siempre accesibles)
  PUBLIC_ROUTES: [
    '/',
    '/catalog',
    '/contact',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/refresh',
    '/api/products',
    '/api/categories',
    '/api/colors'
  ],
  
  // Tiempo de expiración del token (en segundos)
  TOKEN_EXPIRY: 24 * 60 * 60, // 24 horas
  
  // Tiempo de refresh token (en segundos)
  REFRESH_TOKEN_EXPIRY: 7 * 24 * 60 * 60, // 7 días
  
  // Headers de seguridad
  SECURITY_HEADERS: {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;"
  }
};

// Función para verificar JWT
async function verifyToken(token) {
  try {
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET no está configurado');
      return null;
    }

    console.log('🔍 Verificando token con secret:', process.env.JWT_SECRET ? 'Configurado' : 'No configurado');
    
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256'],
      issuer: 'lametatienda-gt',
      audience: 'lametatienda-users'
    });

    console.log('✅ Token verificado exitosamente');
    return payload;
  } catch (error) {
    console.error('❌ Error verificando token:', error.message);
    console.error('❌ Detalles del error:', error);
    return null;
  }
}

// Función para verificar si una ruta requiere autenticación
function isProtectedRoute(pathname) {
  return SECURITY_CONFIG.PROTECTED_ROUTES.some(route => 
    pathname.startsWith(route)
  );
}

// Función para verificar si una ruta requiere rol de administrador
function isAdminRoute(pathname) {
  return SECURITY_CONFIG.ADMIN_ROUTES.some(route => 
    pathname.startsWith(route)
  );
}

// Función para verificar si una ruta es pública
function isPublicRoute(pathname) {
  return SECURITY_CONFIG.PUBLIC_ROUTES.some(route => 
    pathname.startsWith(route)
  );
}

// Función para agregar headers de seguridad
function addSecurityHeaders(response) {
  Object.entries(SECURITY_CONFIG.SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

// Función para crear respuesta de error
function createErrorResponse(message, status = 401) {
  const response = NextResponse.json(
    { error: message },
    { status }
  );
  return addSecurityHeaders(response);
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  console.log(`🔒 Middleware procesando: ${pathname}`);
  console.log(`🔍 ¿Es ruta protegida? ${isProtectedRoute(pathname)}`);
  console.log(`🔍 ¿Es ruta pública? ${isPublicRoute(pathname)}`);
  
  // Agregar headers de seguridad a todas las respuestas
  const response = NextResponse.next();
  addSecurityHeaders(response);
  
  // Permitir rutas públicas sin verificación
  if (isPublicRoute(pathname)) {
    console.log(`✅ Ruta pública: ${pathname}`);
    return response;
  }
  
  // Verificar autenticación para rutas protegidas
  if (isProtectedRoute(pathname)) {
    console.log(`🔐 Verificando autenticación para: ${pathname}`);
    
    // Obtener token de las cookies HttpOnly
    const accessToken = request.cookies.get('accessToken')?.value;
    
    console.log('🍪 Cookies encontradas:', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!request.cookies.get('refreshToken')?.value,
      pathname,
      accessTokenLength: accessToken ? accessToken.length : 0
    });
    
    if (!accessToken) {
      console.log('❌ No se encontró token de acceso en cookies');
      
      // Para rutas de API, devolver error JSON
      if (pathname.startsWith('/api/')) {
        return createErrorResponse('Token de acceso requerido', 401);
      }
      
      // Para rutas de página, redirigir al login
      const loginUrl = new URL('/', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // Verificar token
    console.log('🔍 Verificando token...');
    const payload = await verifyToken(accessToken);
    
    if (!payload) {
      console.log('❌ Token inválido o expirado');
      
      if (pathname.startsWith('/api/')) {
        return createErrorResponse('Token inválido o expirado', 401);
      }
      
      const loginUrl = new URL('/', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('error', 'session_expired');
      return NextResponse.redirect(loginUrl);
    }

    console.log('🔍 Token válido, payload:', { id: payload.id, exp: payload.exp });
    
    // Verificar expiración del token
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      console.log('❌ Token expirado, intentando refresh automático...');
      
      // Intentar refresh automático en el middleware
      const refreshToken = request.cookies.get('refreshToken')?.value;
      if (refreshToken) {
        try {
          // Aquí podríamos hacer el refresh directamente, pero por ahora
          // vamos a permitir que el cliente maneje el refresh
          console.log('🔄 Refresh token disponible, permitiendo que el cliente maneje el refresh');
        } catch (error) {
          console.error('Error en refresh automático:', error);
        }
      }
      
      if (pathname.startsWith('/api/')) {
        return createErrorResponse('Token expirado', 401);
      }
      
      const loginUrl = new URL('/', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('error', 'token_expired');
      return NextResponse.redirect(loginUrl);
    }
    
    // Verificar rol de administrador si es necesario
    if (isAdminRoute(pathname)) {
      console.log(`👑 Verificando rol de administrador para: ${pathname}`);
      
      if (payload.rol !== 'admin') {
        console.log('❌ Acceso denegado: se requiere rol de administrador');
        
        if (pathname.startsWith('/api/')) {
          return createErrorResponse('Acceso denegado: se requiere rol de administrador', 403);
        }
        
        const homeUrl = new URL('/', request.url);
        homeUrl.searchParams.set('error', 'access_denied');
        return NextResponse.redirect(homeUrl);
      }
    }
    
    // Agregar información del usuario al header para uso en las rutas
    response.headers.set('X-User-ID', payload.id.toString());
    response.headers.set('X-User-Role', payload.rol || 'cliente');
    
    console.log(`✅ Autenticación exitosa para usuario ${payload.id}`);
  }
  
  return response;
}

// Configurar en qué rutas ejecutar el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
