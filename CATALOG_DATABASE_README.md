# 🛍️ Catálogo Conectado a Base de Datos

## 📋 Descripción

El catálogo de productos (`/catalog`) ahora está completamente conectado a tu base de datos SQL, mostrando productos reales con filtros dinámicos, paginación y búsqueda.

## 🗄️ APIs Implementadas

### 1. GET `/api/products`
Obtiene productos con filtros y paginación:

**Parámetros:**
- `page` - Página actual (default: 1)
- `limit` - Productos por página (default: 12)
- `category` - Filtrar por categoría
- `minPrice` - Precio mínimo
- `maxPrice` - Precio máximo
- `colors` - Colores separados por coma
- `sortBy` - Ordenamiento (price-low, price-high, name-asc, name-desc)
- `search` - Búsqueda por nombre, descripción o SKU

**Ejemplo de respuesta:**
```javascript
{
  "products": [
    {
      "id": 1,
      "sku": "PROD001",
      "name": "Producto Ejemplo",
      "brand": "Categoría",
      "category": "Electrónicos",
      "description": "Descripción del producto...",
      "image": "/images/producto.jpg",
      "thumbnailImage": "/images/thumb.jpg",
      "price": 99.99,
      "originalPrice": 129.99,
      "minPrice": 99.99,
      "maxPrice": 129.99,
      "rating": 5,
      "reviewCount": 0,
      "hasStock": true,
      "totalStock": 25,
      "colors": [...]
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalProducts": 50,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### 2. GET `/api/catalog/filters`
Obtiene filtros disponibles:

**Respuesta:**
```javascript
{
  "categories": [
    {
      "id": 1,
      "name": "Electrónicos",
      "productCount": 15
    }
  ],
  "colors": [
    {
      "id": 1,
      "name": "Rojo",
      "hex": "#ff0000",
      "productCount": 8
    }
  ],
  "priceRange": {
    "min": 10.00,
    "max": 500.00
  }
}
```

## 🔧 Configuración

### 1. Variables de Entorno
Asegúrate de tener configurado tu archivo `.env`:

```env
DATABASE_URL="mysql://usuario:password@localhost:3306/tu_base_de_datos"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

### 2. Base de Datos
Ejecuta las migraciones de Prisma:

```bash
npx prisma generate
npx prisma db push
```

### 3. Datos de Ejemplo
Inserta productos de prueba:

```sql
-- Insertar categorías
INSERT INTO categorias (nombre) VALUES 
('Electrónicos'),
('Ropa'),
('Calzado'),
('Accesorios');

-- Insertar colores
INSERT INTO colores (nombre, codigo_hex) VALUES 
('Rojo', '#ff0000'),
('Azul', '#0000ff'),
('Verde', '#00ff00'),
('Negro', '#000000'),
('Blanco', '#ffffff');

-- Insertar productos
INSERT INTO productos (sku, nombre, descripcion, categoria_id, url_imagen) VALUES 
('PROD001', 'Smartphone XYZ', 'Smartphone de última generación...', 1, '/images/phone.jpg'),
('PROD002', 'Camiseta Básica', 'Camiseta 100% algodón...', 2, '/images/tshirt.jpg'),
('PROD003', 'Zapatillas Deportivas', 'Zapatillas para running...', 3, '/images/shoes.jpg');

-- Insertar stock
INSERT INTO stock_detalle (producto_id, color_id, cantidad, precio) VALUES 
(1, 1, 10, 299.99),
(1, 2, 15, 299.99),
(2, 4, 20, 29.99),
(2, 5, 25, 29.99),
(3, 1, 8, 89.99),
(3, 3, 12, 89.99);
```

## 🎯 Funcionalidades

### ✅ Implementadas
- [x] **Carga de productos** desde base de datos
- [x] **Filtros dinámicos** por categoría, color y precio
- [x] **Paginación** con información real
- [x] **Ordenamiento** por precio y nombre
- [x] **Búsqueda** por nombre, descripción y SKU
- [x] **Navegación** a detalles del producto
- [x] **Estados de carga** y error
- [x] **Diseño responsive**

### 🔄 Filtros Disponibles
- **Precio:** Rango dinámico basado en precios reales
- **Categorías:** Lista dinámica con contador de productos
- **Colores:** Lista con swatches y contador de productos
- **Ordenamiento:** Precio (asc/desc), Nombre (A-Z/Z-A)

### 📱 Características de UI
- **Vista Grid/Lista** intercambiable
- **Productos por página** configurable (12, 24, 36)
- **Información de resultados** (mostrando X-Y de Z)
- **Navegación sticky** de filtros
- **Estados de carga** para filtros y productos

## 🎨 Componentes Actualizados

### 1. `CatalogPage.jsx`
- Carga productos desde API
- Maneja filtros y paginación
- Estados de carga y error

### 2. `ProductGrid.jsx`
- Muestra productos reales
- Paginación dinámica
- Navegación a detalles

### 3. `ProductFilters.jsx`
- Filtros dinámicos desde BD
- Estados de carga
- Rangos de precio reales

### 4. `productService.js`
- Funciones para obtener productos
- Funciones para obtener filtros
- Manejo de parámetros de consulta

## 🐛 Solución de Problemas

### Error 500 - Base de datos
- Verifica la conexión a la base de datos
- Revisa las migraciones de Prisma
- Confirma que las tablas existen

### No se muestran productos
- Verifica que existan productos en la BD
- Revisa las relaciones entre tablas
- Confirma que `stock_detalle` tenga datos

### Filtros no funcionan
- Verifica que existan categorías y colores
- Revisa la API `/api/catalog/filters`
- Confirma que los parámetros se envíen correctamente

### Imágenes no se cargan
- Verifica que las URLs de imágenes sean correctas
- Asegúrate de que las imágenes estén en `/public`
- Revisa el campo `url_imagen` en la BD

## 📊 Optimizaciones

### Rendimiento
- **Paginación** para evitar cargar todos los productos
- **Filtros en BD** para reducir transferencia de datos
- **Imágenes optimizadas** con Next.js Image
- **Caché de filtros** para mejorar UX

### SEO
- **URLs amigables** con parámetros de filtro
- **Metadatos dinámicos** por categoría
- **Breadcrumbs** para navegación

## 🔗 Integración

### Con Página de Detalles
Los productos del catálogo navegan automáticamente a `/product/[id]` al hacer click.

### Con Carrito
Los botones "Agregar al Carrito" están preparados para integración futura.

### Con Búsqueda
El header incluye búsqueda que se puede conectar con el catálogo.

---

¡Tu catálogo está completamente conectado a la base de datos! 🎉
