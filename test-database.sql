-- Script para verificar y insertar datos de prueba en la base de datos
-- Ejecuta estos comandos en tu base de datos MySQL

-- 1. Verificar si existen datos
SELECT 'Verificando datos existentes...' as info;

-- Verificar categorías
SELECT 'Categorías:' as tabla, COUNT(*) as total FROM categorias;

-- Verificar colores
SELECT 'Colores:' as tabla, COUNT(*) as total FROM colores;

-- Verificar productos
SELECT 'Productos:' as tabla, COUNT(*) as total FROM productos;

-- Verificar stock
SELECT 'Stock:' as tabla, COUNT(*) as total FROM stock_detalle;

-- 2. Insertar datos de prueba si no existen
-- Insertar categorías
INSERT IGNORE INTO categorias (id, nombre) VALUES 
(1, 'Electrónicos'),
(2, 'Ropa'),
(3, 'Calzado'),
(4, 'Accesorios');

-- Insertar colores
INSERT IGNORE INTO colores (id, nombre, codigo_hex) VALUES 
(1, 'Rojo', '#ff0000'),
(2, 'Azul', '#0000ff'),
(3, 'Verde', '#00ff00'),
(4, 'Negro', '#000000'),
(5, 'Blanco', '#ffffff');

-- Insertar productos
INSERT IGNORE INTO productos (id, sku, nombre, descripcion, categoria_id, url_imagen) VALUES 
(1, 'PROD001', 'Smartphone XYZ', 'Smartphone de última generación con cámara de alta resolución', 1, '/assets/11.jpg'),
(2, 'PROD002', 'Camiseta Básica', 'Camiseta 100% algodón, cómoda y duradera', 2, '/assets/22.jpg'),
(3, 'PROD003', 'Zapatillas Deportivas', 'Zapatillas para running con tecnología de amortiguación', 3, '/assets/33.jpg'),
(4, 'PROD004', 'Reloj Inteligente', 'Reloj inteligente con monitor de frecuencia cardíaca', 4, '/assets/44.jpg');

-- Insertar stock
INSERT IGNORE INTO stock_detalle (id, producto_id, color_id, cantidad, precio) VALUES 
(1, 1, 1, 10, 299.99),
(2, 1, 2, 15, 299.99),
(3, 2, 4, 20, 29.99),
(4, 2, 5, 25, 29.99),
(5, 3, 1, 8, 89.99),
(6, 3, 3, 12, 89.99),
(7, 4, 2, 5, 199.99),
(8, 4, 4, 10, 199.99);

-- 3. Verificar datos después de la inserción
SELECT 'Datos después de inserción:' as info;

SELECT 'Categorías:' as tabla, COUNT(*) as total FROM categorias;
SELECT 'Colores:' as tabla, COUNT(*) as total FROM colores;
SELECT 'Productos:' as tabla, COUNT(*) as total FROM productos;
SELECT 'Stock:' as tabla, COUNT(*) as total FROM stock_detalle;

-- 4. Mostrar algunos productos con sus relaciones
SELECT 
    p.id,
    p.sku,
    p.nombre,
    c.nombre as categoria,
    COUNT(sd.id) as variantes_stock
FROM productos p
LEFT JOIN categorias c ON p.categoria_id = c.id
LEFT JOIN stock_detalle sd ON p.id = sd.producto_id
GROUP BY p.id, p.sku, p.nombre, c.nombre;
