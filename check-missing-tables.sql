-- Script para verificar y crear tablas faltantes
-- Basado en el schema de Prisma actual

-- 1. Verificar tablas existentes
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'dbo' 
AND TABLE_TYPE = 'BASE TABLE';

-- 2. Crear tabla hero_images si no existe
CREATE TABLE IF NOT EXISTS `dbo`.`hero_images` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `titulo` VARCHAR(191) NOT NULL,
  `subtitulo` TEXT NULL,
  `url_imagen` VARCHAR(191) NOT NULL,
  `cloudinary_id` VARCHAR(191) NULL,
  `orden` INT NOT NULL DEFAULT 0,
  `activo` BOOLEAN NOT NULL DEFAULT true,
  `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `fecha_actualizacion` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 3. Crear tabla promo_banners si no existe
CREATE TABLE IF NOT EXISTS `dbo`.`promo_banners` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `titulo` VARCHAR(191) NOT NULL,
  `descripcion` TEXT NULL,
  `url_imagen` VARCHAR(191) NOT NULL,
  `cloudinary_id` VARCHAR(191) NULL,
  `enlace` VARCHAR(191) NULL,
  `orden` INT NOT NULL DEFAULT 0,
  `activo` BOOLEAN NOT NULL DEFAULT true,
  `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `fecha_actualizacion` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 4. Crear tabla productos_destacados si no existe
CREATE TABLE IF NOT EXISTS `dbo`.`productos_destacados` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `producto_id` INT NOT NULL,
  `orden` INT NOT NULL DEFAULT 0,
  `fecha_inicio` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `fecha_fin` DATETIME(3) NULL,
  `activo` BOOLEAN NOT NULL DEFAULT true,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `productos_destacados_producto_id_key` (`producto_id`),
  INDEX `productos_destacados_producto_id_fkey` (`producto_id`),
  CONSTRAINT `productos_destacados_producto_id_fkey` FOREIGN KEY (`producto_id`) REFERENCES `dbo`.`productos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 5. Verificar si la tabla ordenes necesita actualización
-- Primero verificar estructura actual
DESCRIBE `dbo`.`ordenes`;

-- 6. Agregar columnas faltantes a ordenes si no existen
ALTER TABLE `dbo`.`ordenes` 
ADD COLUMN IF NOT EXISTS `codigo_orden` VARCHAR(191) NULL,
ADD COLUMN IF NOT EXISTS `nombre_cliente` VARCHAR(191) NULL,
ADD COLUMN IF NOT EXISTS `email_cliente` VARCHAR(191) NULL,
ADD COLUMN IF NOT EXISTS `telefono_cliente` VARCHAR(191) NULL,
ADD COLUMN IF NOT EXISTS `direccion_cliente` TEXT NULL,
ADD COLUMN IF NOT EXISTS `ciudad_cliente` VARCHAR(191) NULL,
ADD COLUMN IF NOT EXISTS `codigo_postal_cliente` VARCHAR(191) NULL,
ADD COLUMN IF NOT EXISTS `subtotal` FLOAT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS `costo_envio` FLOAT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS `metodo_pago` VARCHAR(20) NOT NULL DEFAULT 'contra_entrega',
ADD COLUMN IF NOT EXISTS `estado` VARCHAR(20) NOT NULL DEFAULT 'pendiente',
ADD COLUMN IF NOT EXISTS `comprobante_transferencia` VARCHAR(191) NULL,
ADD COLUMN IF NOT EXISTS `fecha_validacion_transferencia` DATETIME(3) NULL,
ADD COLUMN IF NOT EXISTS `validado_por` INT NULL,
ADD COLUMN IF NOT EXISTS `notas` TEXT NULL;

-- 7. Hacer usuario_id opcional si no lo es
ALTER TABLE `dbo`.`ordenes` MODIFY COLUMN `usuario_id` INT NULL;

-- 8. Agregar índices únicos si no existen
ALTER TABLE `dbo`.`ordenes` 
ADD UNIQUE INDEX IF NOT EXISTS `ordenes_codigo_orden_key` (`codigo_orden`);

-- 9. Agregar relación de validación si no existe
ALTER TABLE `dbo`.`ordenes` 
ADD CONSTRAINT IF NOT EXISTS `ordenes_validado_por_fkey` 
FOREIGN KEY (`validado_por`) REFERENCES `dbo`.`usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- 10. Verificar tablas después de la creación
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'dbo' 
AND TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;
