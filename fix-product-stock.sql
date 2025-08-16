-- Script para verificar y corregir el stock de productos
-- Ejecuta estos comandos en tu base de datos MySQL

-- 1. Verificar qué productos existen
SELECT 'Productos existentes:' as info;
SELECT 
    id,
    sku,
    nombre,
    categoria_id
FROM productos
ORDER BY id;

-- 2. Verificar qué productos tienen stock
SELECT 'Productos con stock:' as info;
SELECT 
    p.id,
    p.sku,
    p.nombre,
    COUNT(sd.id) as stock_count,
    SUM(sd.cantidad) as total_stock
FROM productos p
LEFT JOIN stock_detalle sd ON p.id = sd.producto_id
GROUP BY p.id, p.sku, p.nombre
ORDER BY p.id;

-- 3. Verificar qué productos NO tienen stock
SELECT 'Productos SIN stock:' as info;
SELECT 
    p.id,
    p.sku,
    p.nombre,
    c.nombre as categoria
FROM productos p
LEFT JOIN categorias c ON p.categoria_id = c.id
LEFT JOIN stock_detalle sd ON p.id = sd.producto_id
WHERE sd.id IS NULL
ORDER BY p.id;

-- 4. Verificar colores disponibles
SELECT 'Colores disponibles:' as info;
SELECT 
    id,
    nombre,
    codigo_hex
FROM colores
ORDER BY id;

-- 5. Agregar stock a productos que no lo tienen
-- Producto 4 (Balón de fútbol)
INSERT INTO stock_detalle (producto_id, color_id, cantidad, precio) VALUES 
(4, 1, 15, 29.99),  -- Rojo
(4, 2, 10, 29.99);  -- Azul

-- Producto 5 (Mancuernas 10kg)
INSERT INTO stock_detalle (producto_id, color_id, cantidad, precio) VALUES 
(5, 4, 8, 45.99),   -- Negro
(5, 5, 12, 45.99);  -- Blanco

-- Producto 6 (Taladro inalámbrico)
INSERT INTO stock_detalle (producto_id, color_id, cantidad, precio) VALUES 
(6, 2, 5, 89.99),   -- Azul
(6, 4, 7, 89.99);   -- Negro

-- 6. Verificar después de agregar stock
SELECT 'Después de agregar stock:' as info;
SELECT 
    p.id,
    p.sku,
    p.nombre,
    COUNT(sd.id) as stock_count,
    SUM(sd.cantidad) as total_stock,
    CONCAT('Q', FORMAT(MIN(sd.precio), 2)) as precio_min,
    CONCAT('Q', FORMAT(MAX(sd.precio), 2)) as precio_max
FROM productos p
LEFT JOIN stock_detalle sd ON p.id = sd.producto_id
GROUP BY p.id, p.sku, p.nombre
ORDER BY p.id;

-- 7. Mostrar stock detallado
SELECT 'Stock detallado:' as info;
SELECT 
    p.id,
    p.nombre as producto,
    c.nombre as categoria,
    col.nombre as color,
    sd.cantidad,
    CONCAT('Q', FORMAT(sd.precio, 2)) as precio_formato
FROM productos p
JOIN categorias c ON p.categoria_id = c.id
JOIN stock_detalle sd ON p.id = sd.producto_id
JOIN colores col ON sd.color_id = col.id
ORDER BY p.id, col.nombre;
