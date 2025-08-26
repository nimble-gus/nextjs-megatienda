#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Archivos y carpetas a procesar (excluir tests, scripts y debug)
const sourceDirectories = [
  'src/app',
  'src/components', 
  'src/hooks',
  'src/services',
  'src/lib'
];

// Patrones de console.log a remover (mantener console.error, console.warn)
const consoleLogPatterns = [
  /^\s*console\.log\([^)]*\);\s*$/gm,
  /^\s*console\.log\([^)]*\);\s*\n/gm,
  /console\.log\([^)]*\);\s*$/gm
];

// Patrones más específicos para líneas complejas
const complexPatterns = [
  /^\s*console\.log\('🔍[^']*'[^)]*\);\s*$/gm,
  /^\s*console\.log\('✅[^']*'[^)]*\);\s*$/gm,
  /^\s*console\.log\('❌[^']*'[^)]*\);\s*$/gm,
  /^\s*console\.log\('🔄[^']*'[^)]*\);\s*$/gm,
  /^\s*console\.log\('🛒[^']*'[^)]*\);\s*$/gm,
  /^\s*console\.log\('📤[^']*'[^)]*\);\s*$/gm,
  /^\s*console\.log\('📥[^']*'[^)]*\);\s*$/gm,
  /^\s*console\.log\('🚀[^']*'[^)]*\);\s*$/gm,
];

function cleanConsoleLogsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let removedCount = 0;

    // Aplicar patrones de limpieza
    [...consoleLogPatterns, ...complexPatterns].forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        removedCount += matches.length;
        content = content.replace(pattern, '');
      }
    });

    // Limpiar líneas vacías múltiples
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

    // Solo escribir si hubo cambios
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ ${path.relative(process.cwd(), filePath)}: ${removedCount} console.log removidos`);
      return removedCount;
    }
    
    return 0;
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message);
    return 0;
  }
}

function processDirectory(dirPath) {
  let totalRemoved = 0;
  
  if (!fs.existsSync(dirPath)) {
    console.log(`⚠️ Directorio no existe: ${dirPath}`);
    return 0;
  }

  const files = fs.readdirSync(dirPath, { withFileTypes: true });

  files.forEach(file => {
    const fullPath = path.join(dirPath, file.name);

    if (file.isDirectory()) {
      // Recursivamente procesar subdirectorios
      totalRemoved += processDirectory(fullPath);
    } else if (file.isFile() && (file.name.endsWith('.js') || file.name.endsWith('.jsx'))) {
      // Procesar archivos JavaScript/JSX
      totalRemoved += cleanConsoleLogsInFile(fullPath);
    }
  });

  return totalRemoved;
}

function main() {
  console.log('🧹 Iniciando limpieza de console.log en archivos de producción...\n');
  
  let grandTotal = 0;

  sourceDirectories.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    console.log(`📁 Procesando: ${dir}`);
    const removed = processDirectory(fullPath);
    grandTotal += removed;
    console.log(`   Total en ${dir}: ${removed} console.log removidos\n`);
  });

  console.log(`🎉 Limpieza completada!`);
  console.log(`📊 Total de console.log removidos: ${grandTotal}`);
  console.log('\n💡 Nota: Se mantuvieron console.error y console.warn para debugging');
}

if (require.main === module) {
  main();
}

module.exports = { cleanConsoleLogsInFile, processDirectory };




