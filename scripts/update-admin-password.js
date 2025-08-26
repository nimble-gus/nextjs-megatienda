const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function updateAdminPassword() {
  try {
    console.log('🔄 Iniciando actualización de contraseña de admin...');

    // Solicitar nueva contraseña
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const newPassword = await new Promise((resolve) => {
      readline.question('Ingresa la nueva contraseña para el admin: ', (answer) => {
        readline.close();
        resolve(answer);
      });
    });

    if (!newPassword || newPassword.length < 6) {
      console.log('❌ La contraseña debe tener al menos 6 caracteres');
      process.exit(1);
    }

    // Encriptar nueva contraseña
    console.log('🔐 Encriptando nueva contraseña...');
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Buscar usuario admin existente
    console.log('🔍 Buscando usuario admin...');
    const adminUser = await prisma.usuarios.findFirst({
      where: { rol: 'admin' }
    });

    if (adminUser) {
      // Actualizar contraseña del admin existente
      console.log('👤 Actualizando contraseña del admin existente...');
      await prisma.usuarios.update({
        where: { id: adminUser.id },
        data: { password: hashedPassword }
      });
      console.log('✅ Contraseña del admin actualizada exitosamente');
      console.log(`📧 Email del admin: ${adminUser.correo}`);
    } else {
      // Crear nuevo usuario admin si no existe
      console.log('👤 No se encontró usuario admin. Creando nuevo admin...');
      
      const adminEmail = 'admin@megatienda.com';
      const adminName = 'Administrador';

      const newAdmin = await prisma.usuarios.create({
        data: {
          nombre: adminName,
          correo: adminEmail,
          password: hashedPassword,
          rol: 'admin'
        }
      });

      console.log('✅ Nuevo usuario admin creado exitosamente');
      console.log(`📧 Email: ${adminEmail}`);
      console.log(`👤 Nombre: ${adminName}`);
      console.log(`🔑 Contraseña: ${newPassword}`);
    }

  } catch (error) {
    console.error('❌ Error actualizando contraseña:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdminPassword();





