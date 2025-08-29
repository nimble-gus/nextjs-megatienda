import mysql from 'mysql2/promise';

class TokenBlacklist {
  constructor() {
    this.connection = null;
  }

  async getConnection() {
    if (!this.connection) {
      const databaseUrl = process.env.DATABASE_URL;
      if (!databaseUrl) {
        throw new Error('DATABASE_URL no está configurada');
      }

      const url = new URL(databaseUrl);
      const connectionConfig = {
        host: url.hostname,
        port: parseInt(url.port) || 3306,
        user: url.username,
        password: url.password,
        database: url.pathname.substring(1),
        connectTimeout: 10000,
        acquireTimeout: 10000,
        timeout: 10000,
        reconnect: false
      };

      this.connection = await mysql.createConnection(connectionConfig);
    }
    return this.connection;
  }

  // Agregar sessionId a la blacklist
  async blacklistSession(sessionId) {
    try {
      const connection = await this.getConnection();
      
      // Insertar sessionId en la blacklist usando la tabla existente
      await connection.query(
        'INSERT IGNORE INTO session_blacklist (session_id) VALUES (?)',
        [sessionId]
      );

      console.log('✅ SessionId agregado a blacklist:', sessionId);
    } catch (error) {
      console.error('❌ Error agregando sessionId a blacklist:', error);
      throw error;
    }
  }

  // Verificar si una sesión está en la blacklist
  async isSessionBlacklisted(sessionId) {
    try {
      const connection = await this.getConnection();
      
      // Verificar sessionId específico
      const [specificRows] = await connection.query(
        'SELECT id FROM session_blacklist WHERE session_id = ?',
        [sessionId]
      );

      if (specificRows.length > 0) {
        console.log('❌ SessionId específico encontrado en blacklist:', sessionId);
        return true;
      }

      // Verificar si hay un patrón de invalidación global para el usuario
      if (sessionId && sessionId.includes('-')) {
        const userId = sessionId.split('-')[0];
        const [globalRows] = await connection.query(
          'SELECT id FROM session_blacklist WHERE session_id LIKE ? AND usuario_id = ?',
          [`user-${userId}-all-sessions`, userId]
        );

        if (globalRows.length > 0) {
          console.log('❌ Sesión invalidada globalmente para usuario:', userId);
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('❌ Error verificando blacklist:', error);
      // En caso de error, permitir la sesión (fail-safe)
      return false;
    }
  }

  // Limpiar sesiones antiguas (opcional)
  async cleanup() {
    try {
      const connection = await this.getConnection();
      
      // Eliminar sesiones más antiguas que 7 días
      await connection.query(
        'DELETE FROM session_blacklist WHERE invalidated_at < DATE_SUB(NOW(), INTERVAL 7 DAY)'
      );

      console.log('✅ Blacklist limpiada');
    } catch (error) {
      console.error('❌ Error limpiando blacklist:', error);
    }
  }

  async close() {
    if (this.connection) {
      await this.connection.end();
      this.connection = null;
    }
  }
}

// Instancia singleton
const tokenBlacklist = new TokenBlacklist();

export default tokenBlacklist;
