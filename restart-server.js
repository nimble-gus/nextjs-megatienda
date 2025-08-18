const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function restartServer() {
  console.log('🔄 Reiniciando servidor...');
  
  try {
    // Detener procesos de Node.js
    console.log('⏹️ Deteniendo procesos de Node.js...');
    await execAsync('taskkill /f /im node.exe');
    console.log('✅ Procesos detenidos');
  } catch (error) {
    console.log('ℹ️ No hay procesos de Node.js ejecutándose');
  }
  
  // Esperar un momento
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  try {
    // Reiniciar el servidor
    console.log('🚀 Iniciando servidor...');
    const { stdout, stderr } = await execAsync('npm run dev', { 
      cwd: process.cwd(),
      stdio: 'inherit'
    });
    
    console.log('✅ Servidor reiniciado exitosamente');
    console.log(stdout);
    
    if (stderr) {
      console.log('⚠️ Advertencias:', stderr);
    }
  } catch (error) {
    console.error('❌ Error reiniciando servidor:', error.message);
  }
}

restartServer();
