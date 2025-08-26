// src/lib/session-manager.js
import { jwtVerify, SignJWT } from 'jose';

class SessionManager {
  constructor() {
    this.ACCESS_TOKEN_EXPIRY = 60 * 60; // 1 hora (para testing)
    this.REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 días
    this.ISSUER = 'lametatienda-gt';
    this.AUDIENCE = 'lametatienda-users';
  }

  // Generar access token
  async generateAccessToken(user) {
    try {
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET no está configurado');
      }

      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const now = Math.floor(Date.now() / 1000);

      const token = await new SignJWT({
        id: user.id,
        correo: user.correo,
        rol: user.rol,
        nombre: user.nombre
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt(now)
        .setIssuer(this.ISSUER)
        .setAudience(this.AUDIENCE)
        .setExpirationTime(now + this.ACCESS_TOKEN_EXPIRY)
        .sign(secret);

      return token;
    } catch (error) {
      console.error('Error generando access token:', error);
      throw error;
    }
  }

  // Generar refresh token
  async generateRefreshToken(user) {
    try {
      if (!process.env.JWT_REFRESH_SECRET) {
        throw new Error('JWT_REFRESH_SECRET no está configurado');
      }

      const secret = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET);
      const now = Math.floor(Date.now() / 1000);

      const token = await new SignJWT({
        id: user.id,
        correo: user.correo,
        tipo: 'refresh'
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt(now)
        .setIssuer(this.ISSUER)
        .setAudience(this.AUDIENCE)
        .setExpirationTime(now + this.REFRESH_TOKEN_EXPIRY)
        .sign(secret);

      return token;
    } catch (error) {
      console.error('Error generando refresh token:', error);
      throw error;
    }
  }

  // Verificar access token
  async verifyAccessToken(token) {
    try {
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET no está configurado');
      }

      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret, {
        algorithms: ['HS256'],
        issuer: this.ISSUER,
        audience: this.AUDIENCE
      });

      return payload;
    } catch (error) {
      console.error('Error verificando access token:', error.message);
      return null;
    }
  }

  // Verificar refresh token
  async verifyRefreshToken(token) {
    try {
      if (!process.env.JWT_REFRESH_SECRET) {
        throw new Error('JWT_REFRESH_SECRET no está configurado');
      }

      const secret = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET);
      const { payload } = await jwtVerify(token, secret, {
        algorithms: ['HS256'],
        issuer: this.ISSUER,
        audience: this.AUDIENCE
      });

      // Verificar que sea un refresh token
      if (payload.tipo !== 'refresh') {
        throw new Error('Token no es un refresh token válido');
      }

      return payload;
    } catch (error) {
      console.error('Error verificando refresh token:', error.message);
      return null;
    }
  }

  // Refrescar tokens
  async refreshTokens(refreshToken) {
    try {
      const payload = await this.verifyRefreshToken(refreshToken);
      if (!payload) {
        throw new Error('Refresh token inválido');
      }

      // Obtener datos del usuario desde la base de datos
      const { prisma } = await import('./prisma.js');
      const user = await prisma.usuarios.findUnique({
        where: { id: payload.id },
        select: {
          id: true,
          nombre: true,
          correo: true,
          rol: true
        }
      });

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Generar nuevos tokens
      const newAccessToken = await this.generateAccessToken(user);
      const newRefreshToken = await this.generateRefreshToken(user);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: {
          id: user.id,
          nombre: user.nombre,
          correo: user.correo,
          rol: user.rol
        }
      };
    } catch (error) {
      console.error('Error refrescando tokens:', error);
      throw error;
    }
  }

  // Verificar si un token está próximo a expirar (dentro de 5 minutos)
  isTokenNearExpiry(token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = payload.exp - now;
      
      // Retornar true si expira en menos de 5 minutos
      return timeUntilExpiry < 300;
    } catch (error) {
      console.error('Error verificando expiración del token:', error);
      return true; // Asumir que está próximo a expirar si hay error
    }
  }

  // Obtener tiempo restante del token
  getTokenTimeRemaining(token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      return Math.max(0, payload.exp - now);
    } catch (error) {
      console.error('Error obteniendo tiempo restante del token:', error);
      return 0;
    }
  }

  // Invalidar sesión (logout)
  async invalidateSession(userId) {
    try {
      // Aquí podrías implementar una blacklist de tokens
      // Por ahora, simplemente retornamos éxito
      return true;
    } catch (error) {
      console.error('Error invalidando sesión:', error);
      return false;
    }
  }

  // Validar permisos de usuario
  hasPermission(user, requiredRole) {
    if (!user || !user.rol) {
      return false;
    }

    // Jerarquía de roles
    const roleHierarchy = {
      'cliente': 1,
      'admin': 2
    };

    const userLevel = roleHierarchy[user.rol] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;

    return userLevel >= requiredLevel;
  }

  // Crear sesión completa
  async createSession(user) {
    try {
      const accessToken = await this.generateAccessToken(user);
      const refreshToken = await this.generateRefreshToken(user);

      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          nombre: user.nombre,
          correo: user.correo,
          rol: user.rol
        },
        expiresAt: Math.floor(Date.now() / 1000) + this.ACCESS_TOKEN_EXPIRY
      };
    } catch (error) {
      console.error('Error creando sesión:', error);
      throw error;
    }
  }
}

// Exportar instancia singleton
export const sessionManager = new SessionManager();
