# 🛍️ Página de Detalles del Producto

## 📋 Descripción

La página de detalles del producto (`/product/[id]`) muestra información completa de un producto específico, incluyendo:

- **Galería de imágenes** con navegación
- **Información del producto** (nombre, SKU, descripción)
- **Colores disponibles** con stock por variante
- **Precios** (mínimo y máximo por color)
- **Selector de cantidad**
- **Botones de acción** (Agregar al carrito, Comprar ahora)
- **Productos relacionados** de la misma categoría

## 🗄️ Estructura de Base de Datos

La página utiliza las siguientes tablas de tu base de datos SQL:

### Tabla `productos`
- `id` - ID único del producto
- `sku` - Código SKU del producto
- `nombre` - Nombre del producto
- `descripcion` - Descripción completa
- `url_imagen` - Imagen principal
- `categoria_id` - ID de la categoría

### Tabla `categorias`
- `id` - ID de la categoría
- `nombre` - Nombre de la categoría

### Tabla `imagenes_producto`
- `id` - ID de la imagen
- `producto_id` - ID del producto
- `url_imagen` - URL de la imagen

### Tabla `stock_detalle`
- `id` - ID del stock
- `producto_id` - ID del producto
- `color_id` - ID del color
- `cantidad` - Stock disponible
- `precio` - Precio por color

### Tabla `colores`
- `id` - ID del color
- `nombre` - Nombre del color
- `codigo_hex` - Código hexadecimal del color

## 🚀 APIs Implementadas

### 1. GET `/api/products/[id]`
Obtiene los detalles completos de un producto:

```javascript
// Ejemplo de respuesta
{
  "id": 1,
  "sku": "PROD001",
  "name": "Producto Ejemplo",
  "description": "Descripción del producto...",
  "category": "Electrónicos",
  "categoryId": 1,
  "mainImage": "/images/producto.jpg",
  "images": ["/images/img1.jpg", "/images/img2.jpg"],
  "colors": [
    {
      "id": 1,
      "name": "Rojo",
      "hex": "#ff0000",
      "stock": 10,
      "price": 99.99,
      "available": true
    }
  ],
  "minPrice": 99.99,
  "maxPrice": 129.99,
  "totalStock": 25,
  "hasStock": true
}
```

### 2. GET `/api/products/related`
Obtiene productos relacionados:

```javascript
// Parámetros: categoryId, excludeId, limit
// Ejemplo: /api/products/related?categoryId=1&excludeId=1&limit=4
```

## 🎨 Componentes Principales

### 1. `ProductDetails.jsx`
Componente principal que orquesta toda la página:
- Maneja el estado del color seleccionado
- Controla la cantidad
- Gestiona las acciones del carrito

### 2. `ProductGallery.jsx`
Galería de imágenes con:
- Imagen principal
- Thumbnails navegables
- Controles de navegación
- Indicadores

### 3. `ProductInfo.jsx`
Información del producto:
- Nombre, SKU, descripción
- Selector de colores
- Precios dinámicos
- Controles de cantidad
- Botones de acción

### 4. `RelatedProducts.jsx`
Productos relacionados:
- Grid de productos similares
- Navegación a otros productos
- Precios y disponibilidad

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
Inserta algunos productos de prueba:

```sql
-- Insertar categoría
INSERT INTO categorias (nombre) VALUES ('Electrónicos');

-- Insertar colores
INSERT INTO colores (nombre, codigo_hex) VALUES 
('Rojo', '#ff0000'),
('Azul', '#0000ff'),
('Verde', '#00ff00');

-- Insertar producto
INSERT INTO productos (sku, nombre, descripcion, categoria_id, url_imagen) 
VALUES ('PROD001', 'Producto Ejemplo', 'Descripción del producto...', 1, '/images/producto.jpg');

-- Insertar stock
INSERT INTO stock_detalle (producto_id, color_id, cantidad, precio) VALUES 
(1, 1, 10, 99.99),
(1, 2, 15, 109.99),
(1, 3, 5, 119.99);
```

## 🎯 Funcionalidades

### ✅ Implementadas
- [x] Carga de datos desde base de datos
- [x] Galería de imágenes funcional
- [x] Selector de colores con stock
- [x] Precios dinámicos por color
- [x] Productos relacionados
- [x] Navegación desde catálogo
- [x] Diseño responsive
- [x] Estados de carga y error

### 🔄 Pendientes
- [ ] Integración con carrito de compras
- [ ] Sistema de reviews/ratings
- [ ] Wishlist/favoritos
- [ ] Compartir en redes sociales
- [ ] Zoom en imágenes
- [ ] Videos del producto

## 🎨 Personalización

### Colores y Estilos
Los estilos están en `src/styles/ProductDetails.css` y usan variables CSS:

```css
:root {
  --primary-blue: #3b82f6;
  --text-dark: #1f2937;
  --bg-white: #ffffff;
  --border-light: #e5e7eb;
}
```

### Imágenes
- **Tamaño recomendado:** 800x800px
- **Formato:** JPG, PNG, WebP
- **Optimización:** Next.js Image component automática

## 🐛 Solución de Problemas

### Error 404 - Producto no encontrado
- Verifica que el ID del producto existe en la base de datos
- Revisa la conexión a la base de datos

### Imágenes no se cargan
- Verifica que las URLs de las imágenes sean correctas
- Asegúrate de que las imágenes estén en la carpeta `public`

### Colores no se muestran
- Verifica que existan registros en `stock_detalle`
- Revisa la relación entre `productos`, `colores` y `stock_detalle`

## 📱 Responsive Design

La página está optimizada para:
- **Desktop:** Layout de 2 columnas
- **Tablet:** Layout adaptativo
- **Mobile:** Layout de 1 columna con navegación mejorada

## 🔗 Navegación

### Desde el Catálogo
Los productos en `/catalog` ahora son clickeables y navegan automáticamente a `/product/[id]`.

### Breadcrumbs
La página incluye navegación de breadcrumbs:
`Inicio > Categoría > Nombre del Producto`

---

¡Tu página de detalles del producto está lista para usar! 🎉
