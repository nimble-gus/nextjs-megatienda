import React from 'react';
import { useRouter } from 'next/navigation';
import { useCategories } from '@/hooks/useHomeData';
import '../../styles/CategoriesSection.css';

// Iconos modernos mejorados para cada categoría
const categoryIconMap = {
  1: ( // Juguetes
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2a3 3 0 0 1 3 3 3 3 0 0 1-3 3 3 3 0 0 1-3-3 3 3 0 0 1 3-3zM8 7.5A2.5 2.5 0 0 0 5.5 10v8a2.5 2.5 0 0 0 2.5 2.5h8a2.5 2.5 0 0 0 2.5-2.5v-8A2.5 2.5 0 0 0 16 7.5H8zm2 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm4 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm-4 4a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm4 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
    </svg>
  ),
  2: ( // Fitness  
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14 4.14 5.57 2 7.71 3.43 9.14 4.86 7.71 13.43 16.29 9.86 19.86 11.29 21.29 12.71 19.86 14.14 21.29 16.29 19.14 17.71 20.57 19.14 19.14 17.71 17.71 20.57 14.86z"/>
      <circle cx="8" cy="8" r="2"/>
      <circle cx="16" cy="16" r="2"/>
    </svg>
  ),
  3: ( // Herramientas
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
      <path d="M14.5 13.5L16 15l1.5-1.5L16 12l-1.5 1.5z"/>
    </svg>
  ),
  4: ( // Electrónicos
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M4 6h16v10H4V6zm16 12c1.1 0 2-.9 2-2V6c0-1.11-.9-2-2-2H4c-1.11 0-2 .89-2 2v10c0 1.1.89 2 2 2H0v2h24v-2h-4zM6 8v6h2V8H6zm4 0v6h2V8h-2zm4 0v6h2V8h-2z"/>
      <circle cx="12" cy="11" r="1.5"/>
    </svg>
  ),
  5: ( // Moda
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm7-16.5h-2l-2 4h-6l-2-4h-2l2.5 5c.33.67 1 1 1.7 1h4.6c.7 0 1.37-.33 1.7-1l2.5-5z"/>
      <path d="M19 12v-2h-2v2h-4v-2h-2v2h-4v-2h-2v2c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2z"/>
      <path d="M5 14v7h2v-7h10v7h2v-7H5z"/>
    </svg>
  ),
  6: ( // Libros
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 16H7v-2h5v2zm5-4H7v-2h10v2zm0-4H7V7h10v4z"/>
      <path d="M9 8h6v1H9V8zm0 2h6v1H9v-1z"/>
    </svg>
  )
};

// Configuración de colores para cada categoría
const categoryColors = {
  1: { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', accent: '#667eea' },
  2: { bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', accent: '#f093fb' },
  3: { bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', accent: '#4facfe' },
  4: { bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', accent: '#43e97b' },
  5: { bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', accent: '#fa709a' },
  6: { bg: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', accent: '#a8edea' }
};

// Badges para categorías especiales
const categoryBadges = {
  1: { text: 'Popular', color: '#ff6b6b' },
  4: { text: 'Nuevo', color: '#4ecdc4' },
  5: { text: 'Trending', color: '#45b7d1' }
};

const CategoriesSection = ({ 
  categories = [],
  title = "Explora nuestras categorías",
  subtitle = "Encuentra exactamente lo que necesitas en nuestras secciones especializadas",
  onCategoryClick
}) => {
  const router = useRouter();
  const { categories: categoriesData, loading, error } = useCategories();

  const handleCategoryClick = (categoryId, categoryName) => {
    if (onCategoryClick) {
      onCategoryClick(categoryId, categoryName);
    } else {
      // Navegar al catálogo con filtro de categoría
      const catalogUrl = `/catalog?category=${categoryId}`;
      console.log(`Navigating to catalog:`, {
        categoryId,
        categoryName,
        url: catalogUrl
      });
      router.push(catalogUrl);
    }
  };

  const getCategoryIcon = (categoryId) => {
    return categoryIconMap[categoryId] || (
      <svg fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
      </svg>
    );
  };

  // Usar categorías de props si están disponibles, sino usar las del hook
  const displayCategories = categories.length > 0 ? categories : categoriesData;

  if (loading) {
    return (
      <section className="categories-section-modern">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{title}</h2>
            <p className="section-subtitle">{subtitle}</p>
          </div>
          <div className="categories-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="category-card loading">
                <div className="category-background loading-bg"></div>
                <div className="category-content">
                  <div className="category-icon-wrapper loading-icon"></div>
                  <div className="category-info">
                    <div className="category-name loading-text"></div>
                    <div className="category-count loading-count"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!displayCategories.length) {
    return (
      <section className="categories-section-modern">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{title}</h2>
            <p className="section-subtitle">{subtitle}</p>
          </div>
          <div className="categories-grid">
            <div className="no-categories">
              <p>No hay categorías disponibles</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="categories-section-modern">
      <div className="container">
        {/* Header de la sección */}
        <div className="section-header">
          <h2 className="section-title">{title}</h2>
          <p className="section-subtitle">{subtitle}</p>
          <div className="section-decoration">
            <div className="decoration-line"></div>
            <div className="decoration-dot"></div>
            <div className="decoration-line"></div>
          </div>
        </div>

        {/* Grid de categorías */}
        <div className="categories-grid">
          {displayCategories.map((category, index) => {
            const colors = categoryColors[category.id] || categoryColors[1];
            const badge = categoryBadges[category.id];
            
            return (
              <div
                key={category.id}
                onClick={() => handleCategoryClick(category.id, category.nombre)}
                className="category-card"
                style={{
                  '--category-bg': colors.bg,
                  '--category-accent': colors.accent,
                  '--animation-delay': `${index * 150}ms`
                }}
              >
                {/* Badge si existe */}
                {badge && (
                  <div 
                    className="category-badge"
                    style={{ '--badge-color': badge.color }}
                  >
                    {badge.text}
                  </div>
                )}

                {/* Fondo con gradiente */}
                <div className="category-background"></div>
                
                {/* Efectos decorativos */}
                <div className="category-decoration">
                  <div className="decoration-circle circle-1"></div>
                  <div className="decoration-circle circle-2"></div>
                  <div className="decoration-circle circle-3"></div>
                </div>

                {/* Contenido */}
                <div className="category-content">
                  <div className="category-icon-wrapper">
                    <div className="category-icon">
                      {getCategoryIcon(category.id)}
                    </div>
                  </div>
                  
                  <div className="category-info">
                    <h3 className="category-name">{category.nombre}</h3>
                    <p className="category-description">
                      {category.descripcion || 'Explora nuestra selección'}
                    </p>
                    <div className="category-meta">
                      <span className="category-count">
                        {category.productos || 0} productos
                      </span>
                      <div className="category-arrow">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Overlay para hover */}
                <div className="category-overlay"></div>
              </div>
            );
          })}
        </div>

        {/* Call to action */}
        <div className="section-cta">
          <button 
            className="view-all-btn"
            onClick={() => router.push('/catalog')}
          >
            <span>Ver todas las categorías</span>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;