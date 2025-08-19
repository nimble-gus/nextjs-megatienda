// Script para probar la subida a Cloudinary
const fs = require('fs');

console.log('🧪 Probando configuración de Cloudinary...');

// Verificar variables de entorno
const requiredEnvVars = [
  'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
  'NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET'
];

console.log('📋 Variables de entorno:');
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  console.log(`  ${varName}: ${value ? '✅ Configurada' : '❌ Faltante'}`);
});

console.log('\n🔧 Verificando archivos de dependencias:');

const filesToCheck = [
  'src/services/cloudinaryService.js',
  'src/lib/rate-limiter.js',
  'src/lib/order-queue.js',
  'src/app/api/checkout/create-order/route.js'
];

filesToCheck.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`  ${file}: ${exists ? '✅ Existe' : '❌ No existe'}`);
});

console.log('\n🚨 Posibles problemas:');
console.log('1. Variables de entorno de Cloudinary no configuradas');
console.log('2. Error en el servicio de Cloudinary (variables no definidas)');
console.log('3. Error en el rate-limiter o order-queue');
console.log('4. Error en la base de datos (Prisma)');

console.log('\n💡 Para debuggear:');
console.log('1. Verifica que las variables de entorno estén en .env.local');
console.log('2. Reinicia el servidor después de cambiar variables');
console.log('3. Revisa los logs del servidor en la consola');
console.log('4. Verifica que Cloudinary esté configurado correctamente');

console.log('\n📝 Para probar manualmente:');
console.log('1. Ve al checkout');
console.log('2. Selecciona "Transferencia Bancaria"');
console.log('3. Sube un archivo (imagen o PDF)');
console.log('4. Completa la orden');
console.log('5. Revisa los logs del servidor');
