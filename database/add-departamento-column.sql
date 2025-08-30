-- Agregar columna departamento_cliente a la tabla ordenes
ALTER TABLE ordenes ADD COLUMN departamento_cliente VARCHAR(191) DEFAULT NULL AFTER municipio_cliente;

-- Actualizar registros existentes con un valor por defecto si es necesario
-- UPDATE ordenes SET departamento_cliente = 'Guatemala' WHERE departamento_cliente IS NULL;
