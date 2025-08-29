const mysql = require('mysql2/promise');

async function createBlacklistTable() {
  try {
    console.log('🔧 Creando tabla session_blacklist...');
    
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

    const connection = await mysql.createConnection(connectionConfig);
    console.log('✅ Conectado a la base de datos');

    try {
      // Crear tabla session_blacklist
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS session_blacklist (
          id INT AUTO_INCREMENT PRIMARY KEY,
          session_id VARCHAR(255) NOT NULL UNIQUE,
          invalidated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          usuario_id INT NULL,
          INDEX idx_session_id (session_id),
          INDEX idx_invalidated_at (invalidated_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
      `;

      await connection.query(createTableQuery);
      console.log('✅ Tabla session_blacklist creada exitosamente');

      // Verificar que la tabla existe
      const [tables] = await connection.query('SHOW TABLES LIKE "session_blacklist"');
      if (tables.length > 0) {
        console.log('✅ Tabla session_blacklist verificada');
      } else {
        console.log('❌ Error: La tabla no se creó correctamente');
      }

    } finally {
      await connection.end();
      console.log('🔌 Conexión cerrada');
    }

  } catch (error) {
    console.error('❌ Error creando tabla:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Ejecutar el script
createBlacklistTable();
