// Script para crear usuario administrador
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Verificar si ya existe un admin
    const existingAdmin = await prisma.usuarios.findFirst({
      where: { rol: 'admin' }
    });

    if (existingAdmin) {
      console.log('✅ Ya existe un usuario admin:', existingAdmin.correo);
      return;
    }

    // Crear nuevo admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = await prisma.usuarios.create({
      data: {
        nombre: 'Administrador',
        correo: 'admin@megatienda.com',
        password: hashedPassword,
        rol: 'admin'
      }
    });

    console.log('✅ Usuario admin creado exitosamente:');
    console.log('   Email: admin@megatienda.com');
    console.log('   Password: admin123');
    console.log('   ID:', adminUser.id);

  } catch (error) {
    console.error('❌ Error creando usuario admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
