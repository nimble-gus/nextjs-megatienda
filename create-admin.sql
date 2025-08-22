-- Script SQL para crear usuario administrador
-- Ejecutar este script en tu base de datos MySQL

-- Verificar si ya existe un admin
SELECT COUNT(*) as admin_count FROM dbo.usuarios WHERE rol = 'admin';

-- Insertar usuario administrador (la contraseña es 'admin123' hasheada con bcrypt)
INSERT INTO dbo.usuarios (nombre, correo, contraseña, rol, creado_en) 
VALUES (
    'Administrador',
    'admin@megatienda.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iQeO', -- admin123
    'admin',
    NOW()
) ON DUPLICATE KEY UPDATE 
    nombre = VALUES(nombre),
    correo = VALUES(correo),
    rol = VALUES(rol);

-- Verificar que se creó correctamente
SELECT id, nombre, correo, rol, creado_en 
FROM dbo.usuarios 
WHERE rol = 'admin';
