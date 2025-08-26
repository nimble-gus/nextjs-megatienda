// Script para crear usuario administrador
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Datos del administrador
    const adminData = {
      nombre: 'Administrador',
      correo: 'admin@megatienda.com',
      contraseña: 'admin123', // Contraseña temporal
      rol: 'admin'
    };

    // Verificar si ya existe un admin
    const existingAdmin = await prisma.usuarios.findFirst({
      where: {
        rol: 'admin'
      }
    });

    if (existingAdmin) {
      console.log('⚠️ Ya existe un usuario administrador:', existingAdmin.correo);
      return;
    }

    // Hash de la contraseña
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(adminData.contraseña, saltRounds);

    // Crear el usuario administrador
    const admin = await prisma.usuarios.create({
      data: {
        nombre: adminData.nombre,
        correo: adminData.correo,
        contraseña: hashedPassword,
        rol: adminData.rol
      }
    });

    console.log('✅ Usuario administrador creado exitosamente:');
    console.log('📧 Email:', admin.correo);
    console.log('🔑 Contraseña temporal:', adminData.contraseña);
    console.log('🆔 ID:', admin.id);
    console.log('⚠️ IMPORTANTE: Cambia la contraseña después del primer login');

  } catch (error) {
    console.error('❌ Error creando usuario administrador:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
