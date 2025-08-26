# 🎨 Estilos de Decoración para Secciones

Este documento describe los diferentes estilos de decoración disponibles para las secciones de la página home.

## 📋 Estilos Disponibles

### 1. **Modern** (Por defecto)
Decoración elegante con líneas animadas, puntos brillantes y acentos flotantes.

**Características:**
- ✨ Líneas con efecto shimmer
- 💫 Punto central con pulso luminoso
- 🌟 Acentos flotantes con diferentes colores
- 🎭 Animaciones suaves y fluidas

**Uso:**
```jsx
<CategoriesSection decorationStyle="modern" />
```

### 2. **Geometric**
Decoración moderna con elementos geométricos rotatorios y ondas animadas.

**Características:**
- 🔷 Formas geométricas rotatorias
- 🌊 Ondas con gradientes multicolor
- ⚡ Animaciones más dinámicas
- 🎨 Colores vibrantes y contrastantes

**Uso:**
```jsx
<CategoriesSection decorationStyle="geometric" />
```

## 🎯 Implementación

### Componente CategoriesSection

```jsx
const CategoriesSection = ({ 
  categories = [],
  title = "Explora nuestras categorías",
  subtitle = "Encuentra exactamente lo que necesitas en nuestras secciones especializadas",
  onCategoryClick,
  decorationStyle = "modern" // "modern" o "geometric"
}) => {
  // ... lógica del componente
}
```

### Propiedades

| Propiedad | Tipo | Por defecto | Descripción |
|-----------|------|-------------|-------------|
| `decorationStyle` | `string` | `"modern"` | Estilo de decoración a usar |
| `title` | `string` | `"Explora nuestras categorías"` | Título de la sección |
| `subtitle` | `string` | `"Encuentra exactamente..."` | Subtítulo de la sección |
| `categories` | `array` | `[]` | Lista de categorías |
| `onCategoryClick` | `function` | `undefined` | Callback al hacer clic en categoría |

## 🎨 Personalización

### Agregar Nuevos Estilos

1. **Agregar CSS** en `src/styles/CategoriesSection.css`:
```css
.section-decoration.nuevo-estilo {
  /* Estilos específicos */
}

.nuevo-elemento {
  /* Elementos decorativos */
}
```

2. **Actualizar el componente** en `src/components/Home/CategoriesSection.jsx`:
```jsx
const renderDecoration = () => {
  if (decorationStyle === "nuevo-estilo") {
    return (
      <div className="section-decoration nuevo-estilo">
        <div className="nuevo-elemento"></div>
        {/* Más elementos */}
      </div>
    );
  }
  // ... otros estilos
};
```

3. **Usar el nuevo estilo**:
```jsx
<CategoriesSection decorationStyle="nuevo-estilo" />
```

## 📱 Responsive

Todos los estilos de decoración son completamente responsivos:

- **Desktop**: Elementos completos con todas las animaciones
- **Tablet**: Elementos reducidos manteniendo la funcionalidad
- **Mobile**: Elementos mínimos optimizados para pantallas pequeñas

## 🎭 Animaciones

### Modern Style
- `shimmer`: Efecto de brillo en las líneas
- `pulse-glow`: Pulso luminoso en el punto central
- `float`: Movimiento flotante en los acentos

### Geometric Style
- `rotate-geometric`: Rotación de formas geométricas
- `pulse-geometric`: Pulso en formas geométricas
- `wave-flow`: Flujo de ondas
- `wave-shimmer`: Brillo en las ondas

## 🎨 Colores

Los estilos utilizan la paleta de colores definida en las variables CSS:

```css
:root {
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  /* ... más colores */
}
```

## 🔧 Optimización

- **Performance**: Las animaciones usan `transform` y `opacity` para mejor rendimiento
- **Accesibilidad**: Los elementos decorativos no interfieren con la navegación
- **SEO**: Los elementos son puramente visuales y no afectan el contenido

## 📝 Notas

- Los estilos de decoración son puramente visuales
- No afectan la funcionalidad del componente
- Se pueden combinar con diferentes temas de color
- Las animaciones se desactivan automáticamente si el usuario prefiere movimiento reducido
