-- Script para verificar la relación entre productos y stock_detalle
-- Ejecuta estos comandos en tu base de datos MySQL

-- 1. Verificar la relación JOIN
SELECT 
    p.id as producto_id,
    p.nombre as producto_nombre,
    p.sku,
    sd.id as stock_id,
    sd.cantidad,
    sd.precio,
    c.nombre as color_nombre,
    CONCAT('Q', FORMAT(sd.precio, 2)) as precio_formato
FROM productos p
INNER JOIN stock_detalle sd ON p.id = sd.producto_id
INNER JOIN colores c ON sd.color_id = c.id
ORDER BY p.id, c.nombre;

-- 2. Verificar productos con múltiples variantes de stock
SELECT 
    p.id,
    p.nombre,
    p.sku,
    COUNT(sd.id) as variantes_stock,
    SUM(sd.cantidad) as stock_total,
    CONCAT('Q', FORMAT(MIN(sd.precio), 2)) as precio_min,
    CONCAT('Q', FORMAT(MAX(sd.precio), 2)) as precio_max
FROM productos p
INNER JOIN stock_detalle sd ON p.id = sd.producto_id
GROUP BY p.id, p.nombre, p.sku
ORDER BY p.id;

-- 3. Verificar que no hay stock_detalle sin producto
SELECT 
    'Stock sin producto' as problema,
    sd.id,
    sd.producto_id
FROM stock_detalle sd
LEFT JOIN productos p ON sd.producto_id = p.id
WHERE p.id IS NULL;

-- 4. Verificar que no hay productos sin stock (opcional)
SELECT 
    'Productos sin stock' as problema,
    p.id,
    p.nombre,
    p.sku
FROM productos p
LEFT JOIN stock_detalle sd ON p.id = sd.producto_id
WHERE sd.id IS NULL;

-- 5. Resumen de la relación
SELECT 
    'Resumen de relación' as info,
    COUNT(DISTINCT p.id) as total_productos,
    COUNT(sd.id) as total_stock_variantes,
    COUNT(DISTINCT sd.producto_id) as productos_con_stock
FROM productos p
LEFT JOIN stock_detalle sd ON p.id = sd.producto_id;
