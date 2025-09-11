import { generateDeviceId, getDeviceInfo } from '@/utils/device-utils';

/**
 * Cliente de autenticación para usuarios del sistema
 * Maneja login, logout, registro y validación de credenciales
 */
export class AuthClient {
  constructor() {
    this.baseUrl = '/api/auth/client';
  }

  /**
   * Iniciar sesión del cliente
   */
  async login(email, password) {
    try {
      
      // Generar información del dispositivo
      const deviceId = generateDeviceId();
      const deviceInfo = getDeviceInfo();
      
      
      const response = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          email, 
          password, 
          deviceId, 
          deviceInfo 
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return {
          success: true,
          user: data.user,
          deviceId: data.deviceId,
          message: data.message
        };
      } else {
        console.warn('⚠️ [AuthClient] Login falló:', data.error);
        return {
          success: false,
          error: data.error || 'Error en el login'
        };
      }
    } catch (error) {
      console.error('❌ [AuthClient] Error en login:', error);
      return {
        success: false,
        error: 'Error de conexión'
      };
    }
  }

  /**
   * Cerrar sesión del cliente
   */
  async logout() {
    try {
      
      const response = await fetch(`${this.baseUrl}/logout`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        return { success: true };
      } else {
        console.warn('⚠️ [AuthClient] Logout falló en el servidor');
        return { success: false, error: 'Error en el servidor' };
      }
    } catch (error) {
      console.error('❌ [AuthClient] Error en logout:', error);
      return {
        success: false,
        error: 'Error de conexión'
      };
    }
  }

  /**
   * Registrar nuevo cliente
   */
  async register(userData) {
    try {
      
      const response = await fetch(`${this.baseUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return {
          success: true,
          user: data.user,
          message: data.message
        };
      } else {
        console.warn('⚠️ [AuthClient] Registro falló:', data.error);
        return {
          success: false,
          error: data.error || 'Error en el registro'
        };
      }
    } catch (error) {
      console.error('❌ [AuthClient] Error en registro:', error);
      return {
        success: false,
        error: 'Error de conexión'
      };
    }
  }

  /**
   * Verificar estado de autenticación
   */
  async checkStatus() {
    try {
      
      const response = await fetch(`${this.baseUrl}/status`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        console.warn('⚠️ [AuthClient] Error verificando estado:', response.status);
        return {
          isAuthenticated: false,
          user: null,
          error: 'Error verificando estado'
        };
      }
    } catch (error) {
      console.error('❌ [AuthClient] Error verificando estado:', error);
      return {
        isAuthenticated: false,
        user: null,
        error: 'Error de conexión'
      };
    }
  }

  /**
   * Refrescar token de acceso
   */
  async refreshToken() {
    try {
      
      const response = await fetch(`${this.baseUrl}/refresh`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        return { success: true };
      } else {
        console.warn('⚠️ [AuthClient] Refresh falló:', response.status);
        return { success: false, error: 'Error refrescando token' };
      }
    } catch (error) {
      console.error('❌ [AuthClient] Error refrescando token:', error);
      return {
        success: false,
        error: 'Error de conexión'
      };
    }
  }

  /**
   * Validar credenciales sin iniciar sesión
   */
  async validateCredentials(email, password) {
    try {
      
      // Simular validación sin hacer login real
      const response = await fetch(`${this.baseUrl}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          isValid: data.isValid,
          message: data.message
        };
      } else {
        return {
          success: false,
          error: 'Error validando credenciales'
        };
      }
    } catch (error) {
      console.error('❌ [AuthClient] Error validando credenciales:', error);
      return {
        success: false,
        error: 'Error de conexión'
      };
    }
  }

  /**
   * Obtener información del usuario actual
   */
  async getCurrentUser() {
    try {
      const status = await this.checkStatus();
      if (status.isAuthenticated) {
        return status.user;
      }
      return null;
    } catch (error) {
      console.error('❌ [AuthClient] Error obteniendo usuario actual:', error);
      return null;
    }
  }

  /**
   * Verificar si el usuario está autenticado
   */
  async isAuthenticated() {
    try {
      const status = await this.checkStatus();
      return status.isAuthenticated;
    } catch (error) {
      console.error('❌ [AuthClient] Error verificando autenticación:', error);
      return false;
    }
  }

  /**
   * Limpiar recursos al destruir
   */
  destroy() {
  }
}
