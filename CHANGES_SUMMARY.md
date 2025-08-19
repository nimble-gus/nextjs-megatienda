# 📋 Resumen de Cambios - Checkout y Base de Datos

## 🎯 Cambios Realizados

### 1. **Moneda Guatemalteca**
- ✅ Cambiado `$` por `Q` (Quetzales) en todo el checkout
- ✅ Actualizado precios de envío: `$20.00` → `Q20.00`
- ✅ Actualizado precios de productos y totales

### 2. **Formulario de Facturación**
- ✅ **Estado** → **Departamento**
- ✅ **Ciudad** → **Municipio**
- ✅ Actualizados placeholders y labels

### 3. **Base de Datos**
- ✅ Columna `ciudad_cliente` → `municipio_cliente`
- ✅ Schema de Prisma actualizado
- ✅ APIs actualizadas para usar el nuevo campo

### 4. **Imágenes de Productos**
- ✅ Prioridad: `producto.url_imagen` → `producto.imagenes[0].url` → fallback
- ✅ Mejor manejo de imágenes de productos

### 5. **Archivos Actualizados**
- ✅ `src/app/checkout/page.js`
- ✅ `src/app/checkout/confirmation/page.js`
- ✅ `src/app/api/checkout/create-order/route.js`
- ✅ `src/app/api/admin/orders/route.js`
- ✅ `src/components/admin/OrdersManager.jsx`
- ✅ `prisma/schema.prisma`

## 🚀 Scripts Creados

### Para cambiar la base de datos:
```sql
-- Ejecutar: update-columns.sql
ALTER TABLE `ordenes` ADD COLUMN `municipio_cliente` VARCHAR(191) NULL AFTER `direccion_cliente`;
UPDATE `ordenes` SET `municipio_cliente` = `ciudad_cliente` WHERE `ciudad_cliente` IS NOT NULL;
ALTER TABLE `ordenes` DROP COLUMN `ciudad_cliente`;
```

### Para actualizar Prisma (Windows):
```powershell
# Ejecutar: update-prisma.ps1
.\update-prisma.ps1
```

### Para actualizar Prisma (Linux/Mac):
```bash
# Ejecutar: update-prisma.sh
chmod +x update-prisma.sh
./update-prisma.sh
```

## 📝 Pasos para Aplicar los Cambios

1. **Ejecutar el script SQL** en tu base de datos MySQL
2. **Ejecutar el script de Prisma** para sincronizar
3. **Reiniciar el servidor** de desarrollo
4. **Probar el checkout** con los nuevos cambios

## ✅ Verificación

Después de aplicar los cambios, verifica que:
- ✅ El checkout muestra precios en Quetzales (Q)
- ✅ El formulario muestra "Departamento" y "Municipio"
- ✅ Las imágenes de productos se cargan correctamente
- ✅ Los pedidos se guardan con el nuevo campo `municipio_cliente`
- ✅ El admin panel muestra "Municipio" en lugar de "Ciudad"

## 🔧 Comandos Útiles

```bash
# Verificar estado de Prisma
npx prisma db pull

# Generar cliente de Prisma
npx prisma generate

# Aplicar cambios del schema
npx prisma db push

# Ver logs del servidor
npm run dev
```
