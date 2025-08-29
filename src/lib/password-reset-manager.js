import mysql from 'mysql2/promise';
import crypto from 'crypto';

class PasswordResetManager {
  constructor() {
    this.connection = null;
    this.tokenExpiry = 30 * 60 * 1000; // 30 minutos en milisegundos
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

  // Generar token único y seguro
  generateToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Crear token de reset para un usuario
  async createResetToken(email) {
    try {
      const connection = await this.getConnection();
      
      // Verificar que el usuario existe
      const [users] = await connection.query(
        'SELECT id, nombre FROM usuarios WHERE correo = ?',
        [email]
      );

      if (users.length === 0) {
        return { success: false, error: 'Usuario no encontrado' };
      }

      const user = users[0];
      const token = this.generateToken();
      const expiresAt = new Date(Date.now() + this.tokenExpiry);

      // Eliminar tokens anteriores del usuario
      await connection.query(
        'DELETE FROM password_reset_tokens WHERE usuario_id = ?',
        [user.id]
      );

      // Crear nuevo token
      await connection.query(
        'INSERT INTO password_reset_tokens (usuario_id, token, expira_en) VALUES (?, ?, ?)',
        [user.id, token, expiresAt]
      );

      console.log(`✅ Token de reset creado para ${email}`);
      
      return {
        success: true,
        token,
        expiresAt,
        user: {
          id: user.id,
          nombre: user.nombre,
          email
        }
      };
    } catch (error) {
      console.error('❌ Error creando token de reset:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  }

  // Validar token de reset
  async validateToken(token) {
    try {
      const connection = await this.getConnection();
      
      const [tokens] = await connection.query(
        `SELECT prt.*, u.nombre, u.correo 
         FROM password_reset_tokens prt
         JOIN usuarios u ON prt.usuario_id = u.id
         WHERE prt.token = ? AND prt.usado = 0`,
        [token]
      );

      if (tokens.length === 0) {
        return { valid: false, error: 'Token inválido o ya usado' };
      }

      const tokenRecord = tokens[0];
      const now = new Date();
      const expiresAt = new Date(tokenRecord.expira_en);

      if (now > expiresAt) {
        // Marcar token como expirado
        await connection.query(
          'UPDATE password_reset_tokens SET usado = 1 WHERE id = ?',
          [tokenRecord.id]
        );
        
        return { valid: false, error: 'Token expirado' };
      }

      return {
        valid: true,
        userId: tokenRecord.usuario_id,
        user: {
          nombre: tokenRecord.nombre,
          correo: tokenRecord.correo
        }
      };
    } catch (error) {
      console.error('❌ Error validando token:', error);
      return { valid: false, error: 'Error interno del servidor' };
    }
  }

  // Marcar token como usado
  async markTokenAsUsed(token) {
    try {
      const connection = await this.getConnection();
      
      await connection.query(
        'UPDATE password_reset_tokens SET usado = 1 WHERE token = ?',
        [token]
      );

      console.log(`✅ Token marcado como usado: ${token}`);
      return true;
    } catch (error) {
      console.error('❌ Error marcando token como usado:', error);
      return false;
    }
  }

  // Limpiar tokens expirados
  async cleanup() {
    try {
      const connection = await this.getConnection();
      
      const result = await connection.query(
        'DELETE FROM password_reset_tokens WHERE expira_en < NOW() OR usado = 1'
      );

      console.log(`✅ ${result[0].affectedRows} tokens expirados/usados eliminados`);
      return result[0].affectedRows;
    } catch (error) {
      console.error('❌ Error limpiando tokens:', error);
      return 0;
    }
  }

  // Obtener estadísticas de tokens
  async getStats() {
    try {
      const connection = await this.getConnection();
      
      const [stats] = await connection.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN usado = 1 THEN 1 END) as usados,
          COUNT(CASE WHEN usado = 0 AND expira_en > NOW() THEN 1 END) as activos,
          COUNT(CASE WHEN usado = 0 AND expira_en <= NOW() THEN 1 END) as expirados
        FROM password_reset_tokens
      `);

      return stats[0];
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      return null;
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
const passwordResetManager = new PasswordResetManager();

export default passwordResetManager;
