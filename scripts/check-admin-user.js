const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function checkAndUpdateAdminUser() {
  try {
    console.log('🔍 Checking admin user...');

    // Buscar usuario admin
    const adminUser = await prisma.usuarios.findFirst({
      where: { rol: 'admin' }
    });

    if (!adminUser) {
      console.log('❌ No admin user found');
      return;
    }

    console.log('✅ Admin user found:');
    console.log('   ID:', adminUser.id);
    console.log('   Name:', adminUser.nombre);
    console.log('   Email:', adminUser.correo);
    console.log('   Role:', adminUser.rol);

    // Verificar si la contraseña actual coincide
    const testPassword = '5sadsFSAEjL562213**';
    const isPasswordValid = await bcrypt.compare(testPassword, adminUser.password);
    
    console.log('🔑 Password check:', isPasswordValid ? '✅ Valid' : '❌ Invalid');

    if (!isPasswordValid) {
      console.log('🔄 Updating password...');
      const newHashedPassword = await bcrypt.hash(testPassword, 10);
      
      await prisma.usuarios.update({
        where: { id: adminUser.id },
        data: { password: newHashedPassword }
      });

      console.log('✅ Password updated successfully');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndUpdateAdminUser();
