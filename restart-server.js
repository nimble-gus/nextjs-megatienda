#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 Reiniciando servidor Next.js...');

// Función para limpiar procesos existentes
function cleanupProcesses() {
  return new Promise((resolve) => {
    const isWindows = process.platform === 'win32';
    
    if (isWindows) {
      // En Windows, buscar y terminar procesos de Node.js
      const tasklist = spawn('tasklist', ['/FI', 'IMAGENAME eq node.exe', '/FO', 'CSV']);
      let output = '';
      
      tasklist.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      tasklist.on('close', () => {
        const lines = output.split('\n');
        const nodeProcesses = lines
          .filter(line => line.includes('node.exe'))
          .map(line => {
            const parts = line.split(',');
            return parts[1] ? parts[1].replace(/"/g, '') : null;
          })
          .filter(pid => pid && pid !== 'PID');
        
        if (nodeProcesses.length > 0) {
          console.log(`🔍 Encontrados ${nodeProcesses.length} procesos de Node.js`);
          nodeProcesses.forEach(pid => {
            try {
              spawn('taskkill', ['/PID', pid, '/F']);
              console.log(`✅ Proceso ${pid} terminado`);
            } catch (error) {
              console.log(`⚠️ No se pudo terminar proceso ${pid}:`, error.message);
            }
          });
        }
        
        setTimeout(resolve, 2000);
      });
    } else {
      // En Unix/Linux/Mac
      const pkill = spawn('pkill', ['-f', 'next']);
      pkill.on('close', () => {
        setTimeout(resolve, 2000);
      });
    }
  });
}

// Función para verificar si el puerto está libre
function checkPort(port = 3000) {
  return new Promise((resolve) => {
    const net = require('net');
    const server = net.createServer();
    
    server.listen(port, () => {
      server.close();
      resolve(true);
    });
    
    server.on('error', () => {
      resolve(false);
    });
  });
}

// Función principal
async function restartServer() {
  try {
    // 1. Limpiar procesos existentes
    console.log('🧹 Limpiando procesos existentes...');
    await cleanupProcesses();
    
    // 2. Verificar si el puerto está libre
    console.log('🔍 Verificando puerto 3000...');
    const portFree = await checkPort(3000);
    
    if (!portFree) {
      console.log('⚠️ Puerto 3000 aún ocupado, esperando...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    // 3. Limpiar caché de Next.js
    console.log('🧹 Limpiando caché de Next.js...');
    const nextCacheDir = path.join(__dirname, '.next');
    if (fs.existsSync(nextCacheDir)) {
      fs.rmSync(nextCacheDir, { recursive: true, force: true });
      console.log('✅ Caché de Next.js limpiado');
    }
    
    // 4. Instalar dependencias si es necesario
    console.log('📦 Verificando dependencias...');
    if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
      console.log('📦 Instalando dependencias...');
      const install = spawn('npm', ['install'], { stdio: 'inherit' });
      await new Promise((resolve, reject) => {
        install.on('close', (code) => {
          if (code === 0) resolve();
          else reject(new Error(`npm install failed with code ${code}`));
        });
      });
    }
    
    // 5. Iniciar el servidor
    console.log('🚀 Iniciando servidor de desarrollo...');
    const dev = spawn('npm', ['run', 'dev'], { 
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'development' }
    });
    
    dev.on('error', (error) => {
      console.error('❌ Error iniciando servidor:', error);
      process.exit(1);
    });
    
    dev.on('close', (code) => {
      console.log(`📴 Servidor cerrado con código ${code}`);
      process.exit(code);
    });
    
    // Manejar señales de terminación
    process.on('SIGINT', () => {
      console.log('\n🛑 Recibida señal de terminación...');
      dev.kill('SIGINT');
    });
    
    process.on('SIGTERM', () => {
      console.log('\n🛑 Recibida señal de terminación...');
      dev.kill('SIGTERM');
    });
    
  } catch (error) {
    console.error('❌ Error durante el reinicio:', error);
    process.exit(1);
  }
}

// Ejecutar el script
restartServer();
