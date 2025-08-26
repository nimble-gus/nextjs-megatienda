// Script para probar la validación del NIT
function validateNIT(nit, total) {
  const nitValue = nit.trim().toUpperCase();
  
  // Si el total es menor o igual a Q2499, permitir CF, C/F, Cliente final
  if (total <= 2499) {
    const allowedCFValues = ['CF', 'C/F', 'CLIENTE FINAL', 'CLIENTE FINAL.'];
    if (allowedCFValues.includes(nitValue)) {
      return { valid: true, reason: 'CF válido para compras menores a Q2,500' };
    }
  }
  
  // Para montos mayores a Q2499, NIT es obligatorio y no puede ser CF
  if (total >= 2500) {
    if (!nitValue || nitValue === '' || ['CF', 'C/F', 'CLIENTE FINAL', 'CLIENTE FINAL.'].includes(nitValue)) {
      return { valid: false, reason: 'NIT obligatorio para compras mayores a Q2,500' };
    }
  }
  
  // Validar formato de NIT (debe tener al menos 4 caracteres y ser alfanumérico)
  if (nitValue && nitValue.length < 4) {
    return { valid: false, reason: 'NIT debe tener al menos 4 caracteres' };
  }
  
  // Validar que el NIT tenga un formato válido (números y letras, sin caracteres especiales excepto guiones)
  if (nitValue && !/^[A-Z0-9-]+$/.test(nitValue)) {
    return { valid: false, reason: 'NIT contiene caracteres no válidos' };
  }
  
  return { valid: true, reason: 'NIT válido' };
}

// Casos de prueba
const testCases = [
  // Compras menores a Q2,500
  { nit: 'CF', total: 1000, expected: true },
  { nit: 'C/F', total: 1500, expected: true },
  { nit: 'Cliente Final', total: 2000, expected: true },
  { nit: 'CLIENTE FINAL.', total: 2499, expected: true },
  { nit: '12345678', total: 1000, expected: true },
  { nit: 'ABC-123', total: 2000, expected: true },
  { nit: '', total: 1000, expected: true },
  
  // Compras mayores a Q2,500
  { nit: 'CF', total: 2500, expected: false },
  { nit: 'C/F', total: 3000, expected: false },
  { nit: 'Cliente Final', total: 5000, expected: false },
  { nit: '', total: 2500, expected: false },
  { nit: '12345678', total: 2500, expected: true },
  { nit: 'ABC-123', total: 3000, expected: true },
  { nit: '123', total: 2500, expected: false }, // Muy corto
  { nit: 'ABC@123', total: 2500, expected: false }, // Caracteres especiales
  { nit: 'ABC_123', total: 2500, expected: false }, // Guión bajo no permitido
];

console.log('🧪 Probando validación de NIT...\n');

testCases.forEach((testCase, index) => {
  const result = validateNIT(testCase.nit, testCase.total);
  const passed = result.valid === testCase.expected;
  
  console.log(`Test ${index + 1}: ${passed ? '✅' : '❌'}`);
  console.log(`  NIT: "${testCase.nit}" | Total: Q${testCase.total.toLocaleString()}`);
  console.log(`  Esperado: ${testCase.expected ? 'Válido' : 'Inválido'} | Resultado: ${result.valid ? 'Válido' : 'Inválido'}`);
  console.log(`  Razón: ${result.reason}`);
  console.log('');
});

console.log('📊 Resumen de validación:');
console.log('- Para compras ≤ Q2,499: Se permite CF, C/F, Cliente Final o NIT válido');
console.log('- Para compras ≥ Q2,500: Solo se permite NIT válido (mínimo 4 caracteres)');
console.log('- Formato NIT: Solo letras, números y guiones permitidos');
