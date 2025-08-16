-- Script para verificar todos los productos y su stock
-- Ejecuta estos comandos en tu base de datos MySQL

-- 1. Verificar todos los productos existentes
SELECT 
    p.id,
    p.sku,
    p.nombre,
    c.nombre as categoria,
    p.url_imagen,
    COUNT(sd.id) as stock_count,
    SUM(sd.cantidad) as total_stock,
    MIN(sd.precio) as precio_min,
    MAX(sd.precio) as precio_max
FROM productos p
LEFT JOIN categorias c ON p.categoria_id = c.id
LEFT JOIN stock_detalle sd ON p.id = sd.producto_id
GROUP BY p.id, p.sku, p.nombre, c.nombre, p.url_imagen
ORDER BY p.id;

-- 2. Verificar productos que SÍ tienen stock (los que aparecen en tu tabla)
SELECT 
    p.id,
    p.sku,
    p.nombre,
    c.nombre as categoria,
    COUNT(sd.id) as stock_count,
    SUM(sd.cantidad) as total_stock,
    CONCAT('Q', FORMAT(MIN(sd.precio), 2)) as precio_min_formato,
    CONCAT('Q', FORMAT(MAX(sd.precio), 2)) as precio_max_formato
FROM productos p
JOIN categorias c ON p.categoria_id = c.id
JOIN stock_detalle sd ON p.id = sd.producto_id
GROUP BY p.id, p.sku, p.nombre, c.nombre
ORDER BY p.id;

-- 3. Verificar productos que NO tienen stock
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

-- 4. Mostrar stock detallado de productos que SÍ tienen stock
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

-- 5. Verificar colores disponibles
SELECT 
    id,
    nombre,
    codigo_hex
FROM colores
ORDER BY id;

-- 6. Verificar categorías disponibles
SELECT 
    id,
    nombre
FROM categorias
ORDER BY id;
