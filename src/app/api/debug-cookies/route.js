import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function GET(request) {
  try {
    const cookies = request.cookies;
    const allCookies = {};
    
    // Obtener todas las cookies
    for (const [name, cookie] of cookies.entries()) {
      allCookies[name] = {
        value: cookie.value,
        domain: cookie.domain,
        path: cookie.path,
        secure: cookie.secure,
        sameSite: cookie.sameSite,
        httpOnly: cookie.httpOnly,
        maxAge: cookie.maxAge
      };
    }

    // Verificar tokens si existen
    const accessToken = cookies.get('accessToken')?.value;
    const refreshToken = cookies.get('refreshToken')?.value;
    
    let accessTokenPayload = null;
    let refreshTokenPayload = null;
    let accessTokenError = null;
    let refreshTokenError = null;

    if (accessToken) {
      try {
        const { payload } = await jwtVerify(accessToken, JWT_SECRET);
        accessTokenPayload = payload;
      } catch (error) {
        accessTokenError = error.message;
      }
    }

    if (refreshToken) {
      try {
        const { payload } = await jwtVerify(refreshToken, JWT_SECRET);
        refreshTokenPayload = payload;
      } catch (error) {
        refreshTokenError = error.message;
      }
    }

    // Información del request
    const requestInfo = {
      url: request.url,
      headers: {
        host: request.headers.get('host'),
        'user-agent': request.headers.get('user-agent'),
        'x-forwarded-for': request.headers.get('x-forwarded-for'),
        'x-real-ip': request.headers.get('x-real-ip'),
        'accept-language': request.headers.get('accept-language')
      }
    };

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      requestInfo,
      allCookies,
      accessToken: {
        exists: !!accessToken,
        payload: accessTokenPayload,
        error: accessTokenError
      },
      refreshToken: {
        exists: !!refreshToken,
        payload: refreshTokenPayload,
        error: refreshTokenError
      }
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Error en debugging',
      details: error.message
    }, { status: 500 });
  }
}
