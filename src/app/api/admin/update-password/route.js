import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';

export async function POST(req) {
  try {
    // IMPORTANTE: Este endpoint debe ser removido después de usar
    // Solo para uso en desarrollo/setup inicial
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Endpoint no disponible en producción' },
        { status: 403 }
      );
    }

    const { currentPassword, newPassword, adminEmail } = await req.json();

    // Validaciones
    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: 'La nueva contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    console.log('🔄 Actualizando contraseña de admin...');

    // Buscar admin por email o el primer admin
    let adminUser;
    if (adminEmail) {
      adminUser = await prisma.usuarios.findFirst({
        where: { 
          correo: adminEmail,
          rol: 'admin' 
        }
      });
    } else {
      adminUser = await prisma.usuarios.findFirst({
        where: { rol: 'admin' }
      });
    }

    if (!adminUser) {
      // Crear nuevo admin si no existe
      console.log('👤 Creando nuevo usuario admin...');
      
      const defaultEmail = adminEmail || 'admin@megatienda.com';
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const newAdmin = await prisma.usuarios.create({
        data: {
          nombre: 'Administrador',
          correo: defaultEmail,
          password: hashedPassword,
          rol: 'admin'
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Nuevo admin creado exitosamente',
        admin: {
          id: newAdmin.id,
          email: newAdmin.correo,
          nombre: newAdmin.nombre
        }
      });
    }

    // Si se proporciona contraseña actual, verificarla
    if (currentPassword) {
      const validPassword = await bcrypt.compare(currentPassword, adminUser.password);
      if (!validPassword) {
        return NextResponse.json(
          { error: 'Contraseña actual incorrecta' },
          { status: 400 }
        );
      }
    }

    // Actualizar contraseña
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    await prisma.usuarios.update({
      where: { id: adminUser.id },
      data: { password: hashedNewPassword }
    });

    console.log('✅ Contraseña actualizada exitosamente');

    return NextResponse.json({
      success: true,
      message: 'Contraseña actualizada exitosamente',
      admin: {
        id: adminUser.id,
        email: adminUser.correo,
        nombre: adminUser.nombre
      }
    });

  } catch (error) {
    console.error('❌ Error actualizando contraseña:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
