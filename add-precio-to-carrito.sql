-- Script para agregar el campo precio a la tabla carrito
-- Ejecutar este script en la base de datos MySQL

ALTER TABLE carrito ADD COLUMN precio DECIMAL(10,2) DEFAULT 0.00;

-- Actualizar los registros existentes con el precio del stock_detalle
UPDATE carrito c 
INNER JOIN stock_detalle sd ON c.producto_id = sd.producto_id AND c.color_id = sd.color_id 
SET c.precio = sd.precio 
WHERE c.precio = 0.00;
