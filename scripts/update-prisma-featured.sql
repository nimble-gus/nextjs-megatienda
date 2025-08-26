-- Script para agregar la columna featured a la tabla productos
-- Ejecuta este comando en tu base de datos MySQL

-- 1. Agregar columna featured a la tabla productos
ALTER TABLE productos 
ADD COLUMN featured BOOLEAN DEFAULT FALSE;

-- 2. Marcar algunos productos como destacados (ejemplo)
UPDATE productos SET featured = TRUE WHERE id IN (7, 9, 10, 11);

-- 3. Verificar la implementación
SELECT 
    id,
    nombre,
    featured
FROM productos 
ORDER BY id ASC;

-- 4. Mostrar productos destacados
SELECT 
    id,
    nombre,
    featured,
    categoria_id
FROM productos 
WHERE featured = TRUE
ORDER BY id ASC;
