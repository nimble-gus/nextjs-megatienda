const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createOrUpdateAdmin() {
  try {
    console.log('🔄 Configurando usuario admin...');

    // CONFIGURACIÓN - Cambia estos valores
    const ADMIN_EMAIL = 'admin@megatienda.com';
    const ADMIN_PASSWORD = 'admin123456'; // CAMBIA ESTA CONTRASEÑA
    const ADMIN_NAME = 'Administrador';

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    // Verificar si ya existe un admin
    const existingAdmin = await prisma.usuarios.findFirst({
      where: { rol: 'admin' }
    });

    if (existingAdmin) {
      // Actualizar admin existente
      await prisma.usuarios.update({
        where: { id: existingAdmin.id },
        data: { 
          password: hashedPassword,
          correo: ADMIN_EMAIL,
          nombre: ADMIN_NAME
        }
      });
      console.log('✅ Admin actualizado exitosamente');
    } else {
      // Crear nuevo admin
      await prisma.usuarios.create({
        data: {
          nombre: ADMIN_NAME,
          correo: ADMIN_EMAIL,
          password: hashedPassword,
          rol: 'admin'
        }
      });
      console.log('✅ Admin creado exitosamente');
    }

    console.log('📧 Email:', ADMIN_EMAIL);
    console.log('🔑 Contraseña:', ADMIN_PASSWORD);
    console.log('⚠️  IMPORTANTE: Cambia la contraseña después del primer login');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createOrUpdateAdmin();





