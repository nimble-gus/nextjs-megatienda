// Script para debuggear el problema del checkout
console.log('🔍 Debuggeando problema del checkout...');

console.log('\n📋 Verificando posibles causas:');

console.log('\n1. Variables de entorno de Cloudinary:');
console.log('- NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? '✅ Configurada' : '❌ Faltante');
console.log('- NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET:', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ? '✅ Configurada' : '❌ Faltante');

console.log('\n2. Verificando archivos críticos:');
const fs = require('fs');

const criticalFiles = [
  'src/services/cloudinaryService.js',
  'src/lib/rate-limiter.js', 
  'src/lib/order-queue.js',
  'src/app/api/checkout/create-order/route.js',
  'prisma/schema.prisma'
];

criticalFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`- ${file}: ${exists ? '✅ Existe' : '❌ No existe'}`);
});

console.log('\n3. Verificando dependencias:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = ['@prisma/client', 'next'];
  requiredDeps.forEach(dep => {
    const hasDep = packageJson.dependencies && packageJson.dependencies[dep];
    console.log(`- ${dep}: ${hasDep ? '✅ Instalada' : '❌ Faltante'}`);
  });
} catch (error) {
  console.log('❌ Error leyendo package.json:', error.message);
}

console.log('\n🚨 Posibles soluciones:');

console.log('\nA. Si las variables de Cloudinary faltan:');
console.log('1. Verifica que .env.local existe');
console.log('2. Agrega las variables NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME y NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET');
console.log('3. Reinicia el servidor');

console.log('\nB. Si hay problemas con Prisma:');
console.log('1. Ejecuta: npx prisma generate');
console.log('2. Ejecuta: npx prisma db push');
console.log('3. Verifica la conexión a la base de datos');

console.log('\nC. Si hay problemas con el código:');
console.log('1. Verifica que todos los archivos existen');
console.log('2. Revisa los logs del servidor');
console.log('3. Verifica que no hay errores de sintaxis');

console.log('\nD. Para debuggear en tiempo real:');
console.log('1. Ve al checkout en el navegador');
console.log('2. Abre las herramientas de desarrollador (F12)');
console.log('3. Ve a la pestaña Network');
console.log('4. Intenta completar la orden');
console.log('5. Revisa la petición POST a /api/checkout/create-order');
console.log('6. Revisa los logs del servidor en la terminal');

console.log('\n💡 Comando para ver logs del servidor:');
console.log('npm run dev');
