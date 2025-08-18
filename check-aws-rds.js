const mysql = require('mysql2/promise');
require('dotenv').config();

async function diagnoseRDS() {
  console.log('🔍 Diagnóstico de AWS RDS...\n');
  
  const dbUrl = process.env.DATABASE_URL;
  console.log('📋 DATABASE_URL:', dbUrl ? 'Configurada' : 'No configurada');
  
  if (!dbUrl) {
    console.log('❌ No hay DATABASE_URL configurada');
    return;
  }
  
  // Extraer información de la URL
  const urlMatch = dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  if (urlMatch) {
    const [, user, password, host, port, database] = urlMatch;
    console.log('📊 Información de conexión:');
    console.log(`   Host: ${host}`);
    console.log(`   Puerto: ${port}`);
    console.log(`   Base de datos: ${database}`);
    console.log(`   Usuario: ${user}`);
    console.log(`   Contraseña: ${password ? 'Configurada' : 'No configurada'}\n`);
  }
  
  // Probar conectividad básica
  console.log('🌐 Probando conectividad...');
  try {
    const connection = await mysql.createConnection({
      host: urlMatch[3],
      port: parseInt(urlMatch[4]),
      user: urlMatch[1],
      password: urlMatch[2],
      database: urlMatch[5],
      connectTimeout: 10000,
      acquireTimeout: 10000,
      timeout: 10000,
      reconnect: true
    });
    
    console.log('✅ Conexión exitosa');
    
    // Probar query simple
    const [rows] = await connection.execute('SELECT 1 as test, NOW() as current_time');
    console.log('✅ Query de prueba exitosa:', rows[0]);
    
    // Verificar variables de MySQL
    const [variables] = await connection.execute('SHOW VARIABLES LIKE "%timeout%"');
    console.log('⏱️ Timeouts de MySQL:');
    variables.forEach(v => {
      console.log(`   ${v.Variable_name}: ${v.Value}`);
    });
    
    // Verificar estado de conexiones
    const [connections] = await connection.execute('SHOW STATUS LIKE "Threads_connected"');
    console.log('🔗 Conexiones activas:', connections[0].Value);
    
    await connection.end();
    
  } catch (error) {
    console.log('❌ Error de conexión:', error.message);
    console.log('🔍 Código de error:', error.code);
    
    if (error.code === 'ETIMEDOUT') {
      console.log('💡 Sugerencia: El servidor RDS puede estar apagado o hay problemas de red');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('💡 Sugerencia: El puerto está bloqueado o el servidor no está disponible');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('💡 Sugerencia: Credenciales incorrectas');
    }
  }
  
  console.log('\n📝 Recomendaciones:');
  console.log('1. Verifica que el servidor RDS esté en estado "Available"');
  console.log('2. Verifica que el Security Group permita conexiones desde tu IP');
  console.log('3. Verifica que las credenciales sean correctas');
  console.log('4. Considera usar un pool de conexiones para mejor estabilidad');
}

diagnoseRDS();
