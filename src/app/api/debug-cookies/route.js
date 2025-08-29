import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function GET(request) {
  try {
    const cookies = request.cookies;
    const allCookies = {};
    
    // Obtener todas las cookies usando la API correcta de Next.js
    const cookieNames = ['accessToken', 'refreshToken', 'deviceId', 'sessionId'];
    
    for (const name of cookieNames) {
      const cookie = cookies.get(name);
      if (cookie) {
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
    }

    // Buscar cookies con nombres específicos de dispositivo
    const deviceId = cookies.get('deviceId')?.value;
    if (deviceId) {
      const accessTokenCookieName = `access_${deviceId}`;
      const refreshTokenCookieName = `refresh_${deviceId}`;
      
      const accessCookie = cookies.get(accessTokenCookieName);
      const refreshCookie = cookies.get(refreshTokenCookieName);
      
      if (accessCookie) {
        allCookies[accessTokenCookieName] = {
          value: accessCookie.value,
          domain: accessCookie.domain,
          path: accessCookie.path,
          secure: accessCookie.secure,
          sameSite: accessCookie.sameSite,
          httpOnly: accessCookie.httpOnly,
          maxAge: accessCookie.maxAge
        };
      }
      
      if (refreshCookie) {
        allCookies[refreshTokenCookieName] = {
          value: refreshCookie.value,
          domain: refreshCookie.domain,
          path: refreshCookie.path,
          secure: refreshCookie.secure,
          sameSite: refreshCookie.sameSite,
          httpOnly: refreshCookie.httpOnly,
          maxAge: refreshCookie.maxAge
        };
      }
    }

    // Verificar tokens legacy si existen
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

    // Verificar tokens específicos del dispositivo
    let deviceAccessTokenPayload = null;
    let deviceRefreshTokenPayload = null;
    let deviceAccessTokenError = null;
    let deviceRefreshTokenError = null;

    if (deviceId) {
      const deviceAccessToken = cookies.get(`access_${deviceId}`)?.value;
      const deviceRefreshToken = cookies.get(`refresh_${deviceId}`)?.value;

      if (deviceAccessToken) {
        try {
          const { payload } = await jwtVerify(deviceAccessToken, JWT_SECRET);
          deviceAccessTokenPayload = payload;
        } catch (error) {
          deviceAccessTokenError = error.message;
        }
      }

      if (deviceRefreshToken) {
        try {
          const { payload } = await jwtVerify(deviceRefreshToken, JWT_SECRET);
          deviceRefreshTokenPayload = payload;
        } catch (error) {
          deviceRefreshTokenError = error.message;
        }
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
      deviceId: deviceId,
      legacyTokens: {
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
      },
      deviceTokens: {
        accessToken: {
          exists: !!deviceId && !!cookies.get(`access_${deviceId}`)?.value,
          payload: deviceAccessTokenPayload,
          error: deviceAccessTokenError
        },
        refreshToken: {
          exists: !!deviceId && !!cookies.get(`refresh_${deviceId}`)?.value,
          payload: deviceRefreshTokenPayload,
          error: deviceRefreshTokenError
        }
      }
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Error en debugging',
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
