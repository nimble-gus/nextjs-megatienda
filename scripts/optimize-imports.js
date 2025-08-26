#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Archivos y carpetas a procesar
const sourceDirectories = [
  'src/app',
  'src/components', 
  'src/hooks',
  'src/services',
  'src/lib'
];

// Patrones de optimización
const optimizationPatterns = [
  // Remover import React innecesario (cuando solo se usa JSX)
  {
    pattern: /^import React from 'react';$/gm,
    replacement: '',
    condition: (content) => !content.includes('React.') && !content.includes('React[')
  },
  // Remover import React con hooks (mantener solo los hooks)
  {
    pattern: /^import React, ({[^}]+}) from 'react';$/gm,
    replacement: 'import $1 from \'react\';',
    condition: () => true
  },
  // Remover líneas vacías múltiples después de optimización
  {
    pattern: /\n\s*\n\s*\n/g,
    replacement: '\n\n',
    condition: () => true
  }
];

function optimizeImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let optimizedCount = 0;

    // Aplicar patrones de optimización
    optimizationPatterns.forEach(({ pattern, replacement, condition }) => {
      if (condition(content)) {
        const matches = content.match(pattern);
        if (matches) {
          optimizedCount += matches.length;
          content = content.replace(pattern, replacement);
        }
      }
    });

    // Solo escribir si hubo cambios
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ ${path.relative(process.cwd(), filePath)}: ${optimizedCount} optimizaciones aplicadas`);
      return optimizedCount;
    }
    
    return 0;
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message);
    return 0;
  }
}

function processDirectory(dirPath) {
  let totalOptimized = 0;
  
  if (!fs.existsSync(dirPath)) {
    console.log(`⚠️ Directorio no existe: ${dirPath}`);
    return 0;
  }

  const files = fs.readdirSync(dirPath, { withFileTypes: true });

  files.forEach(file => {
    const fullPath = path.join(dirPath, file.name);

    if (file.isDirectory()) {
      // Recursivamente procesar subdirectorios
      totalOptimized += processDirectory(fullPath);
    } else if (file.isFile() && (file.name.endsWith('.js') || file.name.endsWith('.jsx'))) {
      // Procesar archivos JavaScript/JSX
      totalOptimized += optimizeImportsInFile(fullPath);
    }
  });

  return totalOptimized;
}

function main() {
  console.log('🚀 Iniciando optimización de imports...\n');
  
  let grandTotal = 0;

  sourceDirectories.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    console.log(`📁 Procesando: ${dir}`);
    const optimized = processDirectory(fullPath);
    grandTotal += optimized;
    console.log(`   Total en ${dir}: ${optimized} optimizaciones aplicadas\n`);
  });

  console.log(`🎉 Optimización completada!`);
  console.log(`📊 Total de optimizaciones aplicadas: ${grandTotal}`);
  console.log('\n💡 Los imports de React innecesarios han sido removidos');
}

if (require.main === module) {
  main();
}

module.exports = { optimizeImportsInFile, processDirectory };




