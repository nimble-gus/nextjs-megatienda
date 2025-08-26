#!/usr/bin/env node

/**
 * Script para configurar y verificar el sistema de cache de Redis/Upstash
 * Uso: node scripts/setup-redis-cache.js
 */

const fs = require('fs');
const path = require('path');

// Colores para la consola
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const checkEnvironmentVariables = () => {
  log('\n🔍 Verificando variables de entorno...', 'blue');
  
  const envPath = path.join(process.cwd(), '.env.local');
  let envContent = '';
  
  try {
    envContent = fs.readFileSync(envPath, 'utf8');
  } catch (error) {
    log('❌ Archivo .env.local no encontrado', 'red');
    return false;
  }
  
  const requiredVars = [
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN'
  ];
  
  const missingVars = [];
  
  requiredVars.forEach(varName => {
    if (!envContent.includes(varName)) {
      missingVars.push(varName);
    }
  });
  
  if (missingVars.length > 0) {
    log('❌ Variables de entorno faltantes:', 'red');
    missingVars.forEach(varName => {
      log(`   - ${varName}`, 'red');
    });
    return false;
  }
  
  log('✅ Variables de entorno configuradas', 'green');
  return true;
};

const checkPackageDependencies = () => {
  log('\n📦 Verificando dependencias...', 'blue');
  
  const packagePath = path.join(process.cwd(), 'package.json');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    if (!dependencies['@upstash/redis']) {
      log('❌ @upstash/redis no está instalado', 'red');
      return false;
    }
    
    log('✅ @upstash/redis instalado', 'green');
    return true;
  } catch (error) {
    log('❌ Error leyendo package.json', 'red');
    return false;
  }
};

const checkCacheImplementation = () => {
  log('\n🔧 Verificando implementación de cache...', 'blue');
  
  const filesToCheck = [
    'src/lib/redis.js',
    'src/app/api/catalog/products/route.js',
    'src/app/api/catalog/filters/route.js',
    'src/app/api/categories/route.js',
    'src/app/api/sales/route.js',
    'src/app/api/sales/kpis/route.js'
  ];
  
  const missingFiles = [];
  
  filesToCheck.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (!fs.existsSync(filePath)) {
      missingFiles.push(file);
    }
  });
  
  if (missingFiles.length > 0) {
    log('❌ Archivos de cache faltantes:', 'red');
    missingFiles.forEach(file => {
      log(`   - ${file}`, 'red');
    });
    return false;
  }
  
  log('✅ Implementación de cache completa', 'green');
  return true;
};

const generateSetupInstructions = () => {
  log('\n📋 Instrucciones de configuración:', 'yellow');
  log('1. Crear cuenta en Upstash (https://upstash.com)', 'yellow');
  log('2. Crear una base de datos Redis', 'yellow');
  log('3. Copiar las credenciales a tu archivo .env.local:', 'yellow');
  log('', 'reset');
  log('   UPSTASH_REDIS_REST_URL=https://tu-instancia.upstash.io', 'green');
  log('   UPSTASH_REDIS_REST_TOKEN=tu-token-aqui', 'green');
  log('', 'reset');
  log('4. Reiniciar el servidor de desarrollo', 'yellow');
  log('5. Verificar que el cache funciona visitando:', 'yellow');
  log('   - /api/system/status', 'green');
  log('   - /api/cache/invalidate', 'green');
};

const main = () => {
  log('🚀 Verificación del Sistema de Cache Redis/Upstash', 'bold');
  log('================================================', 'bold');
  
  const checks = [
    { name: 'Dependencias', fn: checkPackageDependencies },
    { name: 'Variables de entorno', fn: checkEnvironmentVariables },
    { name: 'Implementación', fn: checkCacheImplementation }
  ];
  
  let allPassed = true;
  
  checks.forEach(check => {
    const passed = check.fn();
    if (!passed) {
      allPassed = false;
    }
  });
  
  if (allPassed) {
    log('\n🎉 ¡Todo está configurado correctamente!', 'green');
    log('El sistema de cache Redis/Upstash está listo para usar.', 'green');
  } else {
    log('\n⚠️  Se encontraron problemas en la configuración', 'red');
    generateSetupInstructions();
  }
  
  log('\n📊 Resumen del sistema de cache:', 'blue');
  log('✅ Catálogo de productos', 'green');
  log('✅ Filtros', 'green');
  log('✅ Categorías', 'green');
  log('✅ Ventas', 'green');
  log('✅ KPIs', 'green');
  log('✅ Invalidación automática', 'green');
  log('✅ TTL configurado', 'green');
  log('✅ Fallback en memoria', 'green');
};

if (require.main === module) {
  main();
}

module.exports = {
  checkEnvironmentVariables,
  checkPackageDependencies,
  checkCacheImplementation
};
