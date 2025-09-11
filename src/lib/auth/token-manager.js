/**
 * Gestor de tokens para autenticación
 * Maneja la validación, refresh y limpieza de tokens
 */
export class TokenManager {
  constructor() {
    this.accessToken = null;
    this.refreshToken = null;
    this.deviceId = null;
  }

  /**
   * Establecer tokens
   */
  setTokens(accessToken, refreshToken, deviceId) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.deviceId = deviceId;
    
  }

  /**
   * Limpiar tokens
   */
  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    this.deviceId = null;
    
  }

  /**
   * Verificar si hay tokens válidos
   */
  hasValidTokens() {
    return !!(this.accessToken && this.refreshToken && this.deviceId);
  }

  /**
   * Obtener access token
   */
  getAccessToken() {
    return this.accessToken;
  }

  /**
   * Obtener refresh token
   */
  getRefreshToken() {
    return this.refreshToken;
  }

  /**
   * Obtener device ID
   */
  getDeviceId() {
    return this.deviceId;
  }

  /**
   * Verificar si un token está próximo a expirar
   */
  isTokenNearExpiry(token, thresholdMinutes = 5) {
    try {
      const payload = this.decodeToken(token);
      if (!payload || !payload.exp) return true;

      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = payload.exp - now;
      const thresholdSeconds = thresholdMinutes * 60;

      return timeUntilExpiry <= thresholdSeconds;
    } catch (error) {
      console.error('❌ [TokenManager] Error verificando expiración:', error);
      return true;
    }
  }

  /**
   * Decodificar token JWT (sin verificar firma)
   */
  decodeToken(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('❌ [TokenManager] Error decodificando token:', error);
      return null;
    }
  }

  /**
   * Extraer información del token
   */
  extractTokenInfo(token) {
    try {
      const payload = this.decodeToken(token);
      if (!payload) return null;

      return {
        userId: payload.userId,
        email: payload.email,
        rol: payload.rol,
        nombre: payload.nombre,
        sessionToken: payload.sessionToken,
        deviceId: payload.deviceId,
        exp: payload.exp,
        iat: payload.iat
      };
    } catch (error) {
      console.error('❌ [TokenManager] Error extrayendo información del token:', error);
      return null;
    }
  }

  /**
   * Verificar si un token es válido (estructura básica)
   */
  isValidTokenStructure(token) {
    if (!token || typeof token !== 'string') return false;
    
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    try {
      const payload = this.decodeToken(token);
      return !!(payload && payload.userId && payload.exp);
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtener tiempo restante hasta expiración
   */
  getTimeUntilExpiry(token) {
    try {
      const payload = this.decodeToken(token);
      if (!payload || !payload.exp) return 0;

      const now = Math.floor(Date.now() / 1000);
      return Math.max(0, payload.exp - now);
    } catch (error) {
      console.error('❌ [TokenManager] Error calculando tiempo de expiración:', error);
      return 0;
    }
  }

  /**
   * Formatear tiempo restante en formato legible
   */
  formatTimeUntilExpiry(token) {
    const seconds = this.getTimeUntilExpiry(token);
    if (seconds === 0) return 'Expirado';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  }

  /**
   * Verificar si necesita refresh
   */
  needsRefresh(thresholdMinutes = 10) {
    if (!this.accessToken) return false;
    
    return this.isTokenNearExpiry(this.accessToken, thresholdMinutes);
  }

  /**
   * Limpiar recursos al destruir
   */
  destroy() {
    this.clearTokens();
  }
}
