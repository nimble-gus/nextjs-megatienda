-- Script para cambiar ciudad_cliente por municipio_cliente
-- Ejecutar este script en tu base de datos MySQL

-- 1. Agregar la nueva columna municipio_cliente
ALTER TABLE `ordenes` ADD COLUMN `municipio_cliente` VARCHAR(191) NULL AFTER `direccion_cliente`;

-- 2. Copiar los datos de ciudad_cliente a municipio_cliente
UPDATE `ordenes` SET `municipio_cliente` = `ciudad_cliente` WHERE `ciudad_cliente` IS NOT NULL;

-- 3. Eliminar la columna ciudad_cliente
ALTER TABLE `ordenes` DROP COLUMN `ciudad_cliente`;

-- 4. Verificar que el cambio se aplicó correctamente
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'ordenes' 
AND COLUMN_NAME IN ('municipio_cliente', 'ciudad_cliente');

-- 5. Verificar que los datos se copiaron correctamente
SELECT 
    id,
    codigo_orden,
    municipio_cliente,
    COUNT(*) as total_ordenes
FROM `ordenes` 
GROUP BY municipio_cliente 
LIMIT 10;
