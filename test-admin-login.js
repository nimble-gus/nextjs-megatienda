// Script de prueba para la API de login de admin
const testAdminLogin = async () => {
  try {
    console.log('🧪 Probando API de login de admin...');
    
    const response = await fetch('http://localhost:3000/api/auth/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@megatienda.com',
        password: 'admin123'
      }),
      credentials: 'include'
    });

    console.log('📊 Status:', response.status);
    console.log('📊 Status Text:', response.statusText);
    
    const data = await response.json();
    console.log('📊 Response Data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ Login exitoso!');
      console.log('👤 Usuario:', data.user.nombre);
      console.log('📧 Email:', data.user.correo);
      console.log('🔑 Rol:', data.user.rol);
    } else {
      console.log('❌ Error en login:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }
};

// Ejecutar la prueba
testAdminLogin();
