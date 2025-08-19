-- Script para corregir la tabla ordenes
-- Basado en el análisis de la estructura actual

-- 1. Hacer usuario_id opcional (NULL) para permitir guest checkout
ALTER TABLE `dbo`.`ordenes` MODIFY COLUMN `usuario_id` INT NULL;

-- 2. Corregir validado_por de varchar a int
ALTER TABLE `dbo`.`ordenes` MODIFY COLUMN `validado_por` INT NULL;

-- 3. Hacer campos de cliente opcionales para usuarios registrados
ALTER TABLE `dbo`.`ordenes` MODIFY COLUMN `nombre_cliente` VARCHAR(191) NULL;
ALTER TABLE `dbo`.`ordenes` MODIFY COLUMN `email_cliente` VARCHAR(191) NULL;
ALTER TABLE `dbo`.`ordenes` MODIFY COLUMN `telefono_cliente` VARCHAR(191) NULL;
ALTER TABLE `dbo`.`ordenes` MODIFY COLUMN `direccion_cliente` TEXT NULL;
ALTER TABLE `dbo`.`ordenes` MODIFY COLUMN `ciudad_cliente` VARCHAR(191) NULL;
ALTER TABLE `dbo`.`ordenes` MODIFY COLUMN `codigo_postal_cliente` VARCHAR(191) NULL;

-- 4. Agregar foreign key para validado_por si no existe
ALTER TABLE `dbo`.`ordenes` 
ADD CONSTRAINT `ordenes_validado_por_fkey` 
FOREIGN KEY (`validado_por`) REFERENCES `dbo`.`usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- 5. Verificar estructura final
DESCRIBE `dbo`.`ordenes`;

-- 6. Mostrar resumen de cambios
SELECT 
  'Tabla ordenes corregida' as mensaje,
  'usuario_id ahora es NULL' as cambio1,
  'validado_por ahora es INT' as cambio2,
  'campos de cliente ahora son NULL' as cambio3;
