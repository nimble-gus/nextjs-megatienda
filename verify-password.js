const bcrypt = require('bcrypt');

// Contraseña que estamos probando
const password = 'admin123';

// Hash que está en la base de datos (del screenshot)
const hashFromDB = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iQeO';

console.log('🔍 Verificando contraseña...');
console.log('📝 Contraseña:', password);
console.log('🔐 Hash de DB:', hashFromDB);

// Verificar si la contraseña coincide con el hash
bcrypt.compare(password, hashFromDB)
  .then(isValid => {
    console.log('✅ Resultado:', isValid);
    if (isValid) {
      console.log('🎉 La contraseña es correcta!');
    } else {
      console.log('❌ La contraseña no coincide con el hash');
      
      // Generar un nuevo hash para comparar
      return bcrypt.hash(password, 12);
    }
  })
  .then(newHash => {
    if (newHash) {
      console.log('🔄 Nuevo hash generado:', newHash);
      console.log('📋 Usa este hash en la base de datos si el anterior no funciona');
    }
  })
  .catch(error => {
    console.error('❌ Error:', error);
  });
