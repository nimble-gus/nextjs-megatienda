const { exec } = require('child_process');
const fs = require('fs');

console.log('🔄 Reiniciando servidor...');

// Función para matar procesos de Node.js
function killNodeProcesses() {
  return new Promise((resolve) => {
    exec('taskkill /f /im node.exe', (error) => {
      if (error) {
        console.log('No hay procesos de Node.js ejecutándose');
      } else {
        console.log('✅ Procesos de Node.js terminados');
      }
      resolve();
    });
  });
}

// Función para iniciar el servidor
function startServer() {
  console.log('🚀 Iniciando servidor...');
  const child = exec('npm run dev', (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Error iniciando servidor:', error);
      return;
    }
    if (stderr) {
      console.error('⚠️ Advertencias:', stderr);
    }
    console.log('✅ Servidor iniciado correctamente');
  });

  // Mostrar output en tiempo real
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
}

// Ejecutar reinicio
async function restart() {
  await killNodeProcesses();
  
  // Esperar un momento antes de iniciar
  setTimeout(() => {
    startServer();
  }, 3000);
}

restart();
