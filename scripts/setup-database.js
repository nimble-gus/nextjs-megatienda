#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Configuración de Base de Datos para Megatienda');
console.log('================================================\n');

// Verificar si existe el archivo .env
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, 'env.example');

if (!fs.existsSync(envPath)) {
  console.log('❌ No se encontró el archivo .env');
  
  if (fs.existsSync(envExamplePath)) {
    console.log('📋 Copiando archivo de ejemplo...');
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Archivo .env creado desde env.example');
  } else {
    console.log('📝 Creando archivo .env básico...');
    const envContent = `# Database Configuration
DATABASE_URL="mysql://root:@localhost:3306/megatienda"

# Next.js Configuration
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
`;
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Archivo .env creado');
  }
  
  console.log('\n📝 IMPORTANTE: Edita el archivo .env con tu configuración de MySQL');
  console.log('   Ejemplo: DATABASE_URL="mysql://usuario:password@localhost:3306/nombre_bd"');
  console.log('   Si usas XAMPP/WAMP, típicamente es: mysql://root:@localhost:3306/megatienda\n');
} else {
  console.log('✅ Archivo .env encontrado');
}

// Verificar configuración de la base de datos
console.log('🔍 Verificando configuración...');

try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const databaseUrlMatch = envContent.match(/DATABASE_URL="([^"]+)"/);
  
  if (databaseUrlMatch) {
    const databaseUrl = databaseUrlMatch[1];
    console.log('✅ DATABASE_URL configurada:', databaseUrl.replace(/\/\/.*@/, '//***:***@'));
    
    // Extraer información de la URL
    const urlMatch = databaseUrl.match(/mysql:\/\/([^:]+):([^@]*)@([^:]+):(\d+)\/(.+)/);
    if (urlMatch) {
      const [, user, password, host, port, database] = urlMatch;
      console.log(`   Usuario: ${user}`);
      console.log(`   Host: ${host}:${port}`);
      console.log(`   Base de datos: ${database}`);
    }
  } else {
    console.log('❌ DATABASE_URL no encontrada en .env');
  }
} catch (error) {
  console.log('❌ Error leyendo archivo .env:', error.message);
}

console.log('\n📋 Pasos para completar la configuración:');
console.log('1. Asegúrate de que MySQL esté ejecutándose');
console.log('2. Verifica que la base de datos "megatienda" exista');
console.log('3. Ejecuta: npx prisma generate');
console.log('4. Ejecuta: npx prisma db push (si es necesario)');
console.log('5. Inicia el servidor: npm run dev');
console.log('\n🔗 Para probar la conexión, visita: http://localhost:3000/api/admin/products/debug');





