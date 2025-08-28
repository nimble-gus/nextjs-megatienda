console.log('🧪 SCRIPT DE PRUEBA: Separación de Autenticación Admin/Usuario');
console.log('===========================================================');

console.log('\n📋 INSTRUCCIONES DE PRUEBA:');
console.log('1. Abre una ventana de incógnito');
console.log('2. Ve a /admin/login e inicia sesión como admin');
console.log('3. Verifica que estés en el dashboard de admin');
console.log('4. Abre otra pestaña de incógnito');
console.log('5. Ve a /home e intenta iniciar sesión como usuario normal');
console.log('6. Verifica que NO aparezca como admin en la tienda');

console.log('\n🔧 COMANDOS PARA LIMPIAR SESIONES (ejecutar en consola del navegador):');
console.log('// Limpiar localStorage');
console.log('localStorage.removeItem("user");');
console.log('localStorage.removeItem("adminUser");');
console.log('localStorage.clear();');
console.log('');
console.log('// Limpiar cookies');
console.log('document.cookie.split(";").forEach(function(c) {');
console.log('  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");');
console.log('});');
console.log('');
console.log('// Limpiar sessionStorage');
console.log('sessionStorage.clear();');

console.log('\n✅ VERIFICACIONES:');
console.log('- Admin login debe usar: adminAccessToken, adminRefreshToken, adminUser');
console.log('- Usuario normal debe usar: accessToken, refreshToken, user');
console.log('- No debe haber conflictos entre las dos sesiones');
console.log('- Cada contexto debe limpiar automáticamente los datos del otro');

console.log('\n🚀 Para reiniciar el servidor:');
console.log('npm run dev');
