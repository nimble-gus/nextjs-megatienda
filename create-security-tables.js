const mysql = require('mysql2/promise');
require('dotenv').config();

async function createSecurityTables() {
  let connection;
  
  try {
    console.log('🔧 Creando tablas de seguridad...');
    
    // Configuración de conexión
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

    connection = await mysql.createConnection(connectionConfig);
    console.log('✅ Conexión establecida');

    // 1. Tabla failed_logins (si no existe)
    console.log('📋 Creando tabla failed_logins...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS failed_logins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        ip_address VARCHAR(45) NOT NULL,
        user_agent TEXT,
        intentos INT DEFAULT 1,
        bloqueado_hasta DATETIME NULL,
        ultimo_intento DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email_ip (email, ip_address),
        INDEX idx_ultimo_intento (ultimo_intento)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Tabla failed_logins creada/verificada');

    // 2. Tabla password_reset_tokens (si no existe)
    console.log('📋 Creando tabla password_reset_tokens...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        token VARCHAR(255) UNIQUE NOT NULL,
        expira_en DATETIME NOT NULL,
        usado BOOLEAN DEFAULT FALSE,
        creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_token (token),
        INDEX idx_usuario_id (usuario_id),
        INDEX idx_expira_en (expira_en)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Tabla password_reset_tokens creada/verificada');

    // 3. Tabla email_verification_tokens (si no existe)
    console.log('📋 Creando tabla email_verification_tokens...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS email_verification_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        token VARCHAR(255) UNIQUE NOT NULL,
        expira_en DATETIME NOT NULL,
        usado BOOLEAN DEFAULT FALSE,
        creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_token (token),
        INDEX idx_usuario_id (usuario_id),
        INDEX idx_expira_en (expira_en)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Tabla email_verification_tokens creada/verificada');

    // 4. Tabla account_activity_log (si no existe)
    console.log('📋 Creando tabla account_activity_log...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS account_activity_log (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NULL,
        accion VARCHAR(100) NOT NULL,
        detalles TEXT,
        ip_address VARCHAR(45),
        user_agent TEXT,
        fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
        exito BOOLEAN DEFAULT TRUE,
        INDEX idx_usuario_id (usuario_id),
        INDEX idx_fecha (fecha),
        INDEX idx_accion (accion)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Tabla account_activity_log creada/verificada');

    // 5. Tabla rate_limits (si no existe)
    console.log('📋 Creando tabla rate_limits...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS rate_limits (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ip_address VARCHAR(45) NOT NULL,
        endpoint VARCHAR(255) NOT NULL,
        intentos INT DEFAULT 1,
        bloqueado_hasta DATETIME NULL,
        ultimo_intento DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_ip_endpoint (ip_address, endpoint),
        INDEX idx_ultimo_intento (ultimo_intento)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Tabla rate_limits creada/verificada');

    // Verificar que todas las tablas existen
    console.log('🔍 Verificando tablas creadas...');
    const [tables] = await connection.execute(`
      SHOW TABLES LIKE '%failed_logins%'
    `);
    
    if (tables.length > 0) {
      console.log('✅ Tabla failed_logins existe');
    }

    const [tables2] = await connection.execute(`
      SHOW TABLES LIKE '%password_reset_tokens%'
    `);
    
    if (tables2.length > 0) {
      console.log('✅ Tabla password_reset_tokens existe');
    }

    const [tables3] = await connection.execute(`
      SHOW TABLES LIKE '%email_verification_tokens%'
    `);
    
    if (tables3.length > 0) {
      console.log('✅ Tabla email_verification_tokens existe');
    }

    const [tables4] = await connection.execute(`
      SHOW TABLES LIKE '%account_activity_log%'
    `);
    
    if (tables4.length > 0) {
      console.log('✅ Tabla account_activity_log existe');
    }

    const [tables5] = await connection.execute(`
      SHOW TABLES LIKE '%rate_limits%'
    `);
    
    if (tables5.length > 0) {
      console.log('✅ Tabla rate_limits existe');
    }

    console.log('🎉 ¡Todas las tablas de seguridad han sido creadas exitosamente!');

  } catch (error) {
    console.error('❌ Error creando tablas:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión cerrada');
    }
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  createSecurityTables()
    .then(() => {
      console.log('✅ Script completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en el script:', error);
      process.exit(1);
    });
}

module.exports = createSecurityTables;
