# 📋 Página de Catálogo - LaMega TiendaGT

## 🎯 Descripción General

La página de catálogo es una funcionalidad completa que permite a los usuarios explorar productos con filtros avanzados, múltiples vistas y paginación. Está diseñada para ser responsive y ofrecer una experiencia de usuario moderna.

## 🏗️ Estructura de Archivos

```
src/
├── app/
│   └── catalog/
│       └── page.js                 # Página principal del catálogo
├── components/
│   └── Catalog/
│       ├── ProductFilters.jsx      # Componente de filtros
│       └── ProductGrid.jsx         # Componente de cuadrícula de productos
└── styles/
    ├── CatalogPage.css            # Estilos de la página principal
    ├── ProductFilters.css         # Estilos de los filtros
    └── ProductGrid.css            # Estilos de la cuadrícula
```

## 🚀 Funcionalidades Implementadas

### ✅ **Filtros Avanzados**
- **Rango de Precios**: Slider interactivo con inputs numéricos
- **Categorías**: Checkboxes con contadores de productos
- **Colores**: Swatches visuales con checkboxes
- **Botón "Limpiar Todo"**: Reset de todos los filtros

### ✅ **Vista de Productos**
- **Vista Grid**: Cuadrícula 3x4 responsive
- **Vista Lista**: Lista horizontal con más detalles
- **Placeholders de Imágenes**: Patrón de diseño temporal
- **Información Completa**: Nombre, marca, precio, descuento, rating

### ✅ **Controles de Usuario**
- **Ordenamiento**: Por precio, nombre, rating
- **Items por página**: 12, 24, 36 productos
- **Paginación**: Navegación entre páginas
- **Contador de resultados**: "Mostrando X-Y de Z resultados"

### ✅ **Diseño Responsive**
- **Desktop**: Sidebar fijo + grid principal
- **Tablet**: Layout adaptativo
- **Mobile**: Stack vertical con filtros colapsables

## 🎨 Características de Diseño

### **Paleta de Colores**
- **Primario**: Azul (#1e3a8a) - Profesional y confiable
- **Accent**: Naranja (#f97316) - Llamadas a la acción
- **Neutros**: Grises para texto y bordes

### **Efectos Visuales**
- **Hover Effects**: Transformaciones suaves en tarjetas
- **Overlays**: Botones de acción en hover
- **Shadows**: Profundidad y jerarquía visual
- **Transitions**: Animaciones fluidas

### **Tipografía**
- **Títulos**: Font-weight 600-700
- **Texto**: Font-weight 400-500
- **Precios**: Font-weight 700 para destacar

## 📱 Responsive Breakpoints

```css
/* Desktop */
@media (min-width: 1024px) {
  grid-template-columns: 280px 1fr;
}

/* Tablet */
@media (max-width: 1024px) {
  grid-template-columns: 250px 1fr;
}

/* Mobile */
@media (max-width: 768px) {
  grid-template-columns: 1fr;
}
```

## 🔧 Datos de Ejemplo

### **Productos Mock**
```javascript
const mockProducts = [
  {
    id: 1,
    name: "Simple Modern School Bags",
    brand: "Wonder",
    category: "Bag",
    price: 10.00,
    originalPrice: 25.00,
    color: "Red",
    rating: 5,
    image: "/assets/products/bag1.jpg"
  },
  // ... más productos
];
```

### **Categorías Disponibles**
- Jacket (1)
- Classic Watch (1)
- Trending Watch (1)
- Shoes (1)
- Bags (1)
- Backpack (1)
- T-shirt (1)
- Dress (1)
- Sunglasses (1)

### **Colores Disponibles**
- Red (#dc2626)
- Dark Blue (#1e3a8a)
- Orange (#f97316)
- Purple (#7c3aed)
- Yellow (#eab308)
- Green (#059669)

## 🔄 Estado de la Aplicación

### **Filtros**
```javascript
const [filters, setFilters] = useState({
  priceRange: [10, 300],
  categories: [],
  colors: []
});
```

### **Paginación**
```javascript
const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(12);
```

### **Vista**
```javascript
const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
const [sortBy, setSortBy] = useState('default');
```

## 🗄️ Integración con Base de Datos

### **Próximos Pasos**
1. **Crear API Routes** para productos
2. **Conectar Prisma** con el esquema existente
3. **Implementar filtros reales** en la base de datos
4. **Agregar imágenes reales** de productos
5. **Implementar búsqueda** por texto

### **Estructura de BD Esperada**
```sql
-- Tabla productos (ya existe)
productos (
  id, nombre, descripcion, precio, 
  precio_original, categoria_id, color_id
)

-- Tabla categorías (ya existe)
categorias (id, nombre)

-- Tabla colores (ya existe)
colores (id, nombre, hex_code)
```

## 🧪 Testing

### **Funcionalidades a Probar**
- ✅ Filtros de precio funcionan correctamente
- ✅ Selección de categorías múltiples
- ✅ Selección de colores múltiples
- ✅ Cambio entre vista grid y lista
- ✅ Paginación funciona
- ✅ Ordenamiento de productos
- ✅ Responsive en diferentes dispositivos

## 🚀 Cómo Usar

1. **Navegar al catálogo**: Click en "Catálogo" en el header
2. **Aplicar filtros**: Usar sidebar izquierdo
3. **Cambiar vista**: Botones grid/list en la barra superior
4. **Ordenar**: Dropdown "Ordenar por"
5. **Navegar**: Paginación en la parte inferior

## 📈 Próximas Mejoras

### **Funcionalidades Futuras**
- [ ] Búsqueda por texto en tiempo real
- [ ] Filtros avanzados (marca, rating, etc.)
- [ ] Wishlist/Favoritos
- [ ] Comparación de productos
- [ ] Filtros guardados
- [ ] Vista rápida de productos
- [ ] Carrito desde el catálogo

### **Optimizaciones**
- [ ] Lazy loading de imágenes
- [ ] Virtual scrolling para muchos productos
- [ ] Cache de filtros
- [ ] SEO optimizado
- [ ] PWA features

## 🔗 Enlaces Relacionados

- **Home**: `/`
- **Catálogo**: `/catalog`
- **Categorías**: `/categories` (pendiente)
- **Contacto**: `/contact` (pendiente)

---

**Desarrollado para LaMega TiendaGT** 🛒
*Todo lo que buscas al alcance de un CLICK*
