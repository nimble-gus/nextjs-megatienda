-- Script para agregar columna NIT a la tabla ordenes
-- Ejecutar este script para agregar el campo NIT

ALTER TABLE `dbo`.`ordenes` 
ADD COLUMN `nit_cliente` VARCHAR(20) NULL AFTER `codigo_postal_cliente`;

-- Verificar que se agregó correctamente
DESCRIBE `dbo`.`ordenes`;

-- Mostrar resumen del cambio
SELECT 
  'Columna NIT agregada exitosamente' as mensaje,
  'nit_cliente VARCHAR(20) NULL' as nueva_columna,
  'Posición: después de codigo_postal_cliente' as posicion;
