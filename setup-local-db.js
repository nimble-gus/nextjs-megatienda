const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupLocalDatabase() {
  try {
    console.log('🔧 Configurando base de datos local...');
    
    // Crear conexión a MySQL local (sin especificar base de datos)
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '', // Sin contraseña para desarrollo local
      port: 3306
    });
    
    console.log('✅ Conectado a MySQL local');
    
    // Crear base de datos si no existe
    await connection.execute('CREATE DATABASE IF NOT EXISTS megatienda_local');
    console.log('✅ Base de datos megatienda_local creada/verificada');
    
    // Usar la base de datos
    await connection.execute('USE megatienda_local');
    
    // Crear tablas básicas (ejemplo simplificado)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS categorias (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL
      )
    `);
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS productos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(200) NOT NULL,
        descripcion TEXT,
        sku VARCHAR(50),
        url_imagen VARCHAR(500),
        categoria_id INT,
        featured BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (categoria_id) REFERENCES categorias(id)
      )
    `);
    
    // Insertar datos de ejemplo
    await connection.execute(`
      INSERT IGNORE INTO categorias (id, nombre) VALUES 
      (1, 'Electrónicos'),
      (2, 'Ropa'),
      (3, 'Hogar')
    `);
    
    await connection.execute(`
      INSERT IGNORE INTO productos (id, nombre, descripcion, sku, url_imagen, categoria_id, featured) VALUES 
      (1, 'Laptop Gaming', 'Laptop para gaming de alto rendimiento', 'LAP-001', 'https://via.placeholder.com/300x300/4F46E5/FFFFFF?text=Laptop', 1, true),
      (2, 'Camiseta Deportiva', 'Camiseta cómoda para deportes', 'CAM-001', 'https://via.placeholder.com/300x300/10B981/FFFFFF?text=Camiseta', 2, false),
      (3, 'Lámpara LED', 'Lámpara LED moderna para el hogar', 'LAM-001', 'https://via.placeholder.com/300x300/F59E0B/FFFFFF?text=Lampara', 3, true)
    `);
    
    console.log('✅ Datos de ejemplo insertados');
    
    await connection.end();
    
    console.log('\n🎉 Base de datos local configurada exitosamente!');
    console.log('📝 Para usar esta base de datos, cambia tu DATABASE_URL a:');
    console.log('DATABASE_URL="mysql://root:@localhost:3306/megatienda_local"');
    
  } catch (error) {
    console.error('❌ Error configurando base de datos local:', error.message);
    console.log('\n💡 Asegúrate de tener MySQL instalado y corriendo localmente');
    console.log('💡 O instala XAMPP/WAMP para tener MySQL fácilmente');
  }
}

setupLocalDatabase();
