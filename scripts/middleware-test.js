import { NextResponse } from 'next/server';

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  console.log(`🔒 MIDDLEWARE TEST - Procesando: ${pathname}`);
  
  // Para rutas de API de carrito, verificar autenticación
  if (pathname.startsWith('/api/cart')) {
    console.log(`🔐 MIDDLEWARE TEST - Verificando autenticación para: ${pathname}`);
    
    const accessToken = request.cookies.get('accessToken')?.value;
    console.log(`🍪 MIDDLEWARE TEST - Access token encontrado: ${!!accessToken}`);
    
    if (!accessToken) {
      console.log('❌ MIDDLEWARE TEST - No hay token de acceso');
      return NextResponse.json(
        { error: 'Token de acceso requerido' },
        { status: 401 }
      );
    }
    
    console.log('✅ MIDDLEWARE TEST - Token encontrado, continuando...');
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
