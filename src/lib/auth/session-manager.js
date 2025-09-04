/**
 * Gestor de sesiones para autenticación de clientes
 * Maneja el ciclo completo de vida de una sesión
 */
export class SessionManager {
  constructor() {
    this.refreshTimer = null;
    this.isRefreshing = false;
    this.refreshInterval = null;
    this.sessionCheckInterval = null;
  }

  /**
   * Iniciar una nueva sesión
   */
  async startSession(userData, tokens, deviceId) {
    try {
      console.log('🚀 [SessionManager] Iniciando nueva sesión...');
      
      // Guardar datos en localStorage
      localStorage.setItem('clientUser', JSON.stringify(userData));
      localStorage.setItem('clientDeviceId', deviceId);
      localStorage.setItem('sessionStartTime', Date.now().toString());
      
      // Configurar refresh automático
      this.setupAutoRefresh(tokens.refreshToken);
      
      // Configurar verificación de sesión
      this.setupSessionCheck();
      
      console.log('✅ [SessionManager] Sesión iniciada correctamente');
      return true;
    } catch (error) {
      console.error('❌ [SessionManager] Error iniciando sesión:', error);
      return false;
    }
  }

  /**
   * Cerrar sesión
   */
  async endSession() {
    try {
      console.log('🔄 [SessionManager] Cerrando sesión...');
      
      // Limpiar timers
      this.clearTimers();
      
      // Limpiar localStorage
      localStorage.removeItem('clientUser');
      localStorage.removeItem('clientDeviceId');
      localStorage.removeItem('sessionStartTime');
      
      // Limpiar cookies del lado del cliente
      this.clearClientCookies();
      
      console.log('✅ [SessionManager] Sesión cerrada correctamente');
      return true;
    } catch (error) {
      console.error('❌ [SessionManager] Error cerrando sesión:', error);
      return false;
    }
  }

  /**
   * Configurar refresh automático de tokens
   */
  setupAutoRefresh(refreshToken) {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    // Refresh cada 14 minutos (los tokens expiran en 24h)
    this.refreshInterval = setInterval(async () => {
      if (!this.isRefreshing) {
        await this.performTokenRefresh();
      }
    }, 14 * 60 * 1000);

    console.log('🔄 [SessionManager] Refresh automático configurado');
  }

  /**
   * Configurar verificación periódica de sesión
   */
  setupSessionCheck() {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
    }

    // Verificar estado de sesión cada 5 minutos
    this.sessionCheckInterval = setInterval(async () => {
      await this.checkSessionStatus();
    }, 5 * 60 * 1000);

    console.log('🔍 [SessionManager] Verificación de sesión configurada');
  }

  /**
   * Realizar refresh de token
   */
  async performTokenRefresh() {
    try {
      this.isRefreshing = true;
      console.log('🔄 [SessionManager] Iniciando refresh de token...');

      const response = await fetch('/api/auth/client/refresh', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        console.log('✅ [SessionManager] Token refrescado correctamente');
        // El refresh endpoint ya actualiza las cookies
      } else {
        console.warn('⚠️ [SessionManager] Refresh falló, sesión expirada');
        await this.endSession();
        // Emitir evento para que el contexto sepa que debe limpiar el estado
        window.dispatchEvent(new CustomEvent('sessionExpired'));
      }
    } catch (error) {
      console.error('❌ [SessionManager] Error en refresh:', error);
      await this.endSession();
      window.dispatchEvent(new CustomEvent('sessionExpired'));
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Verificar estado de la sesión
   */
  async checkSessionStatus() {
    try {
      console.log('🔍 [SessionManager] Verificando estado de sesión...');

      const response = await fetch('/api/auth/client/status', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.isAuthenticated) {
          console.log('✅ [SessionManager] Sesión válida');
          return true;
        } else {
          console.warn('⚠️ [SessionManager] Sesión no válida');
          await this.endSession();
          window.dispatchEvent(new CustomEvent('sessionExpired'));
          return false;
        }
      } else {
        console.warn('⚠️ [SessionManager] Error verificando sesión');
        return false;
      }
    } catch (error) {
      console.error('❌ [SessionManager] Error verificando sesión:', error);
      return false;
    }
  }

  /**
   * Limpiar timers
   */
  clearTimers() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
      this.sessionCheckInterval = null;
    }
    console.log('🧹 [SessionManager] Timers limpiados');
  }

  /**
   * Limpiar cookies del lado del cliente
   */
  clearClientCookies() {
    document.cookie = 'clientAccessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'clientRefreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'clientDeviceId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    console.log('🍪 [SessionManager] Cookies del cliente limpiadas');
  }

  /**
   * Obtener datos de la sesión actual
   */
  getCurrentSession() {
    const user = localStorage.getItem('clientUser');
    const deviceId = localStorage.getItem('clientDeviceId');
    const sessionStartTime = localStorage.getItem('sessionStartTime');

    if (user && deviceId && sessionStartTime) {
      return {
        user: JSON.parse(user),
        deviceId,
        sessionStartTime: parseInt(sessionStartTime)
      };
    }

    return null;
  }

  /**
   * Verificar si hay una sesión activa
   */
  hasActiveSession() {
    const session = this.getCurrentSession();
    if (!session) return false;

    // Verificar que la sesión no tenga más de 7 días
    const sessionAge = Date.now() - session.sessionStartTime;
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 días en ms

    return sessionAge < maxAge;
  }

  /**
   * Limpiar recursos al destruir
   */
  destroy() {
    this.clearTimers();
    console.log('🗑️ [SessionManager] Recursos limpiados');
  }
}
