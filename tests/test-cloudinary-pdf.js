// Script para probar la subida de PDFs a Cloudinary
const fs = require('fs');

console.log('🧪 Probando configuración de Cloudinary para PDFs...');

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

console.log('\n🔧 Configuración recomendada para Cloudinary:');
console.log('1. Ve a tu dashboard de Cloudinary');
console.log('2. Settings > Upload > Upload presets');
console.log('3. Verifica que tu preset tenga:');
console.log('   - Signing Mode: Unsigned');
console.log('   - Folder: comprobantes-transferencia');
console.log('   - Allowed Formats: jpg, jpeg, png, gif, webp, pdf');
console.log('   - Access Mode: Public');

console.log('\n📝 Para probar la funcionalidad:');
console.log('1. Ve al checkout');
console.log('2. Selecciona "Transferencia Bancaria"');
console.log('3. Sube un archivo PDF');
console.log('4. Completa la orden');
console.log('5. Ve al admin > Pedidos > Ver Comprobante');

console.log('\n🚨 Si sigues viendo error 401:');
console.log('- Verifica que el upload preset sea "Unsigned"');
console.log('- Verifica que el archivo sea público');
console.log('- Verifica que la URL no tenga parámetros de autenticación');
console.log('- Intenta acceder directamente a la URL del PDF en el navegador');

console.log('\n💡 Soluciones adicionales:');
console.log('- Si el PDF no se muestra en iframe, usa el enlace "Abrir en nueva pestaña"');
console.log('- Los PDFs se pueden descargar directamente desde la URL de Cloudinary');
console.log('- Cloudinary maneja PDFs como documentos, no como imágenes');
