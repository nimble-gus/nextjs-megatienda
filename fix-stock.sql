-- Script para agregar stock a los productos existentes
-- Ejecuta estos comandos en tu base de datos MySQL

-- 1. Verificar productos sin stock
SELECT 
    p.id,
    p.sku,
    p.nombre,
    c.nombre as categoria,
    COUNT(sd.id) as stock_count
FROM productos p
LEFT JOIN categorias c ON p.categoria_id = c.id
LEFT JOIN stock_detalle sd ON p.id = sd.producto_id
GROUP BY p.id, p.sku, p.nombre, c.nombre
HAVING stock_count = 0;

-- 2. Verificar productos que SÍ tienen stock
SELECT 
    p.id,
    p.sku,
    p.nombre,
    c.nombre as categoria,
    COUNT(sd.id) as stock_count,
    SUM(sd.cantidad) as total_stock,
    MIN(sd.precio) as precio_min,
    MAX(sd.precio) as precio_max
FROM productos p
LEFT JOIN categorias c ON p.categoria_id = c.id
LEFT JOIN stock_detalle sd ON p.id = sd.producto_id
GROUP BY p.id, p.sku, p.nombre, c.nombre
HAVING stock_count > 0;

-- 3. Mostrar stock detallado de productos que SÍ tienen stock
SELECT 
    p.id,
    p.nombre as producto,
    c.nombre as categoria,
    col.nombre as color,
    sd.cantidad,
    sd.precio,
    CONCAT('Q', FORMAT(sd.precio, 2)) as precio_formato
FROM productos p
JOIN categorias c ON p.categoria_id = c.id
JOIN stock_detalle sd ON p.id = sd.producto_id
JOIN colores col ON sd.color_id = col.id
ORDER BY p.id, col.nombre;

-- 4. Agregar stock a productos que no lo tienen (si es necesario)
-- Solo ejecutar si hay productos sin stock

-- INSERT INTO stock_detalle (producto_id, color_id, cantidad, precio) VALUES 
-- (1, 1, 10, 299.99),  -- Ejemplo para producto 1
-- (2, 2, 15, 199.99);  -- Ejemplo para producto 2

-- 5. Verificar el rango de precios total
SELECT 
    'Rango de precios total' as info,
    MIN(precio) as precio_minimo,
    MAX(precio) as precio_maximo,
    CONCAT('Q', FORMAT(MIN(precio), 2)) as precio_min_formato,
    CONCAT('Q', FORMAT(MAX(precio), 2)) as precio_max_formato
FROM stock_detalle;
