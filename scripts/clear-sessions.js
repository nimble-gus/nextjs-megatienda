const fs = require('fs');
const path = require('path');

console.log('🧹 Limpiando sesiones y cookies...');

// Función para limpiar localStorage en el navegador
const clearLocalStorage = () => {
  console.log('📝 Para limpiar localStorage, ejecuta en la consola del navegador:');
  console.log('localStorage.removeItem("user");');
  console.log('localStorage.removeItem("adminUser");');
  console.log('localStorage.clear();');
};

// Función para limpiar cookies
const clearCookies = () => {
  console.log('🍪 Para limpiar cookies, ejecuta en la consola del navegador:');
  console.log('document.cookie.split(";").forEach(function(c) { document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); });');
};

// Función para limpiar sessionStorage
const clearSessionStorage = () => {
  console.log('💾 Para limpiar sessionStorage, ejecuta en la consola del navegador:');
  console.log('sessionStorage.clear();');
};

// Mostrar instrucciones
console.log('\n🔧 INSTRUCCIONES PARA LIMPIAR SESIONES:');
console.log('=====================================');
clearLocalStorage();
console.log('');
clearCookies();
console.log('');
clearSessionStorage();

console.log('\n✅ Después de limpiar las sesiones:');
console.log('1. Reinicia el servidor de desarrollo');
console.log('2. Abre una ventana de incógnito');
console.log('3. Prueba el login de admin y el login de usuario normal');
console.log('4. Verifica que no haya conflictos entre las sesiones');

console.log('\n🚀 Para reiniciar el servidor:');
console.log('npm run dev');
