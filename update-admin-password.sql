-- Script para actualizar la contraseña del administrador
-- La nueva contraseña será 'admin123' con el hash correcto

UPDATE dbo.usuarios 
SET contraseña = '$2b$12$rY5X/s7IVXbLISpsbJfeIe4G/9bB1l7nm1IEEhJAXSuhZ4lKvdvM.'
WHERE correo = 'admin@megatienda.com' AND rol = 'admin';

-- Verificar que se actualizó correctamente
SELECT id, nombre, correo, rol, creado_en 
FROM dbo.usuarios 
WHERE correo = 'admin@megatienda.com' AND rol = 'admin';
