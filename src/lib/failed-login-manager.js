import mysql from 'mysql2/promise';

class FailedLoginManager {
  constructor() {
    this.connection = null;
    this.maxAttempts = 5; // Máximo 5 intentos
    this.blockDuration = 15 * 60 * 1000; // 15 minutos en milisegundos
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

  // Registrar un intento fallido
  async recordFailedAttempt(email, ipAddress, userAgent) {
    try {
      const connection = await this.getConnection();
      
      // Buscar intentos existentes
      const [existing] = await connection.query(
        'SELECT * FROM failed_logins WHERE email = ? AND ip_address = ?',
        [email, ipAddress]
      );

      if (existing.length > 0) {
        const record = existing[0];
        const newAttempts = record.intentos + 1;
        const isBlocked = newAttempts >= this.maxAttempts;
        const blockedUntil = isBlocked ? new Date(Date.now() + this.blockDuration) : null;

        // Actualizar intentos
        await connection.query(
          `UPDATE failed_logins 
           SET intentos = ?, bloqueado_hasta = ?, ultimo_intento = NOW() 
           WHERE id = ?`,
          [newAttempts, blockedUntil, record.id]
        );

        console.log(`❌ Intento fallido ${newAttempts}/${this.maxAttempts} para ${email}`);
        return { attempts: newAttempts, isBlocked, blockedUntil };
      } else {
        // Crear nuevo registro
        await connection.query(
          'INSERT INTO failed_logins (email, ip_address, user_agent, intentos) VALUES (?, ?, ?, 1)',
          [email, ipAddress, userAgent]
        );

        console.log(`❌ Primer intento fallido para ${email}`);
        return { attempts: 1, isBlocked: false, blockedUntil: null };
      }
    } catch (error) {
      console.error('❌ Error registrando intento fallido:', error);
      // En caso de error, permitir el intento (fail-safe)
      return { attempts: 0, isBlocked: false, blockedUntil: null };
    }
  }

  // Verificar si el email/IP está bloqueado
  async isBlocked(email, ipAddress) {
    try {
      const connection = await this.getConnection();
      
      const [records] = await connection.query(
        'SELECT * FROM failed_logins WHERE email = ? AND ip_address = ?',
        [email, ipAddress]
      );

      if (records.length === 0) {
        return { isBlocked: false, attempts: 0, blockedUntil: null };
      }

      const record = records[0];
      const now = new Date();
      const blockedUntil = record.bloqueado_hasta ? new Date(record.bloqueado_hasta) : null;
      
      // Verificar si el bloqueo ha expirado
      if (blockedUntil && now < blockedUntil) {
        const remainingMinutes = Math.ceil((blockedUntil - now) / (1000 * 60));
        return { 
          isBlocked: true, 
          attempts: record.intentos, 
          blockedUntil,
          remainingMinutes
        };
      }

      // Si el bloqueo expiró, resetear intentos
      if (blockedUntil && now >= blockedUntil) {
        await this.resetAttempts(email, ipAddress);
        return { isBlocked: false, attempts: 0, blockedUntil: null };
      }

      return { 
        isBlocked: record.intentos >= this.maxAttempts, 
        attempts: record.intentos, 
        blockedUntil 
      };
    } catch (error) {
      console.error('❌ Error verificando bloqueo:', error);
      // En caso de error, permitir el intento (fail-safe)
      return { isBlocked: false, attempts: 0, blockedUntil: null };
    }
  }

  // Resetear intentos después de login exitoso
  async resetAttempts(email, ipAddress) {
    try {
      const connection = await this.getConnection();
      
      await connection.query(
        'DELETE FROM failed_logins WHERE email = ? AND ip_address = ?',
        [email, ipAddress]
      );

      console.log(`✅ Intentos reseteados para ${email}`);
    } catch (error) {
      console.error('❌ Error reseteando intentos:', error);
    }
  }

  // Limpiar registros antiguos (más de 24 horas)
  async cleanup() {
    try {
      const connection = await this.getConnection();
      
      await connection.query(
        'DELETE FROM failed_logins WHERE ultimo_intento < DATE_SUB(NOW(), INTERVAL 24 HOUR)'
      );

      console.log('✅ Registros de intentos fallidos limpiados');
    } catch (error) {
      console.error('❌ Error limpiando registros:', error);
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
const failedLoginManager = new FailedLoginManager();

export default failedLoginManager;
