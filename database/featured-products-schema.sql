-- Script para implementar productos destacados
-- Ejecuta estos comandos en tu base de datos MySQL

-- 1. Agregar columna featured a la tabla productos
ALTER TABLE productos 
ADD COLUMN featured BOOLEAN DEFAULT FALSE;

-- 2. Crear tabla para control avanzado de productos destacados
CREATE TABLE productos_destacados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    producto_id INT NOT NULL,
    orden INT DEFAULT 0,
    fecha_inicio DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_fin DATETIME NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    UNIQUE KEY unique_producto_orden (producto_id, orden)
);

-- 3. Crear índices para mejor rendimiento
CREATE INDEX idx_productos_featured ON productos(featured);
CREATE INDEX idx_productos_destacados_activo ON productos_destacados(activo);
CREATE INDEX idx_productos_destacados_fechas ON productos_destacados(fecha_inicio, fecha_fin);

-- 4. Marcar algunos productos como destacados (ejemplo)
UPDATE productos SET featured = TRUE WHERE id IN (1, 2, 3, 4);

-- 5. Insertar productos en la tabla de control avanzado (ejemplo)
INSERT INTO productos_destacados (producto_id, orden, fecha_inicio, fecha_fin, activo) VALUES
(1, 1, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), TRUE),
(2, 2, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), TRUE),
(3, 3, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), TRUE),
(4, 4, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), TRUE);

-- 6. Verificar la implementación
SELECT 
    p.id,
    p.nombre,
    p.featured,
    pd.orden,
    pd.activo,
    pd.fecha_inicio,
    pd.fecha_fin
FROM productos p
LEFT JOIN productos_destacados pd ON p.id = pd.producto_id
WHERE p.featured = TRUE OR pd.activo = TRUE
ORDER BY pd.orden ASC, p.id ASC;
