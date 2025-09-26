import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCategories } from '@/hooks/useHomeData';
import useCategoryImages from '@/hooks/useCategoryImages';
import '../../styles/CategoriesSection.css';

// Iconos minimalistas modernos para cada categoría
const categoryIconMap = {
  1: ( // Juguetes
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
  ),
  2: ( // Fitness  
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14 4.14 5.57 2 7.71 3.43 9.14 4.86 7.71 13.43 16.29 9.86 19.86 11.29 21.29 12.71 19.86 14.14 21.29 16.29 19.14 17.71 20.57 19.14 19.14 17.71 17.71 20.57 14.86z"/>
    </svg>
  ),
  3: ( // Herramientas
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
    </svg>
  ),
  4: ( // Electrónicos
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M4 6h16v10H4V6zm16 12c1.1 0 2-.9 2-2V6c0-1.11-.9-2-2-2H4c-1.11 0-2 .89-2 2v10c0 1.1.89 2 2 2H0v2h24v-2h-4z"/>
    </svg>
  ),
  5: ( // Moda
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm7-16.5h-2l-2 4h-6l-2-4h-2l2.5 5c.33.67 1 1 1.7 1h4.6c.7 0 1.37-.33 1.7-1l2.5-5z"/>
    </svg>
  ),
  6: ( // Libros
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 16H7v-2h5v2zm5-4H7v-2h10v2zm0-4H7V7h10v4z"/>
    </svg>
  )
};

// Configuración de categorías con colores e imágenes por defecto
const categoryConfig = {
  1: { // Juguetes
    name: 'Juguetes',
    primary: '#6366f1', 
    secondary: '#8b5cf6', 
    accent: '#a78bfa',
    bgImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    overlay: 'rgba(99, 102, 241, 0.8)'
  },
  2: { // Fitness
    name: 'Fitness',
    primary: '#ec4899', 
    secondary: '#f472b6', 
    accent: '#fbbf24',
    bgImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    overlay: 'rgba(236, 72, 153, 0.8)'
  },
  3: { // Herramientas
    name: 'Herramientas',
    primary: '#06b6d4', 
    secondary: '#0891b2', 
    accent: '#0ea5e9',
    bgImage: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    overlay: 'rgba(6, 182, 212, 0.8)'
  },
  4: { // Electrónicos
    name: 'Electrónicos',
    primary: '#10b981', 
    secondary: '#059669', 
    accent: '#34d399',
    bgImage: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    overlay: 'rgba(16, 185, 129, 0.8)'
  },
  5: { // Mascotas
    name: 'Mascotas',
    primary: '#f59e0b', 
    secondary: '#d97706', 
    accent: '#fbbf24',
    bgImage: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    overlay: 'rgba(245, 158, 11, 0.8)'
  },
  6: { // Libros
    name: 'Libros',
    primary: '#8b5cf6', 
    secondary: '#7c3aed', 
    accent: '#a78bfa',
    bgImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    overlay: 'rgba(139, 92, 246, 0.8)'
  }
};

const CategoriesSection = ({ 
  categories = [],
  title = "Categorías",
  subtitle = "Descubre nuestra amplia selección de productos organizados por categorías",
  onCategoryClick
}) => {
  const router = useRouter();
  const { categories: categoriesData, loading, error } = useCategories();
  const { categoryImages, loading: imagesLoading } = useCategoryImages();
  const [isClient, setIsClient] = useState(false);

  // Solucionar problema de hidratación
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Forzar re-renderizado cuando cambien las categorías
  useEffect(() => {
    if (isClient) {
      // Pequeño delay para asegurar que los estilos se apliquen correctamente
      const timer = setTimeout(() => {
        // Forzar re-renderizado
        setIsClient(prev => !prev);
        setTimeout(() => setIsClient(true), 0);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [categoriesData, isClient]);

  const handleCategoryClick = (categoryId, categoryName) => {
    if (onCategoryClick) {
      onCategoryClick(categoryId, categoryName);
    } else {
      const catalogUrl = `/catalog?category=${categoryId}`;
      router.push(catalogUrl);
    }
  };

  const getCategoryIcon = (categoryId) => {
    return categoryIconMap[categoryId] || (
      <svg fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
    );
  };

  // Solo procesar categorías en el cliente para evitar problemas de hidratación
  const allCategories = isClient ? (categories.length > 0 ? categories : categoriesData) : [];
  const displayCategories = allCategories.slice(0, 6);

  if (loading || !isClient) {
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
                <div className="category-skeleton">
                  <div className="skeleton-icon"></div>
                  <div className="skeleton-content">
                    <div className="skeleton-title"></div>
                    <div className="skeleton-subtitle"></div>
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
          <div className="empty-state">
            <div className="empty-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h3>No hay categorías disponibles</h3>
            <p>Pronto tendremos nuevas categorías para ti</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="categories-section-modern" key={`categories-${isClient ? 'client' : 'server'}`} suppressHydrationWarning>
      <div className="container">
        {/* Header minimalista */}
        <div className="section-header">
          <h2 className="section-title">{title}</h2>
          <p className="section-subtitle">{subtitle}</p>
        </div>

        {/* Grid de categorías moderno */}
        <div className="categories-grid">
          {displayCategories.map((category, index) => {
            const config = categoryConfig[category.id] || categoryConfig[1];
            
            // Obtener imagen dinámica o usar la por defecto
            const dynamicImage = categoryImages[category.id]?.imageUrl || config.bgImage;
            
            return (
              <div
                key={`${category.id}-${isClient ? 'client' : 'server'}`}
                onClick={() => handleCategoryClick(category.id, category.nombre)}
                className="category-card"
                style={{
                  '--primary-color': config.primary,
                  '--secondary-color': config.secondary,
                  '--accent-color': config.accent,
                  '--bg-image': `url(${dynamicImage})`,
                  '--overlay-color': config.overlay,
                  '--animation-delay': `${index * 100}ms`
                }}
                suppressHydrationWarning
              >
                {/* Imagen de fondo */}
                <div className="category-bg-image"></div>
                
                {/* Overlay de color */}
                <div className="category-overlay"></div>

                {/* Contenido principal */}
                <div className="category-content">
                  <div className="category-icon">
                    {getCategoryIcon(category.id)}
                  </div>
                  
                  <div className="category-info">
                    <h3 className="category-name" suppressHydrationWarning>{category.nombre}</h3>
                    <p className="category-count" suppressHydrationWarning>
                      {category.productos || 0} productos
                    </p>
                  </div>

                  {/* Indicador de hover */}
                  <div className="category-indicator">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                    </svg>
                  </div>
                </div>

                {/* Efecto de brillo en hover */}
                <div className="category-shine"></div>
              </div>
            );
          })}
        </div>

        {/* CTA minimalista */}
        <div className="section-cta">
          <button 
            className="view-all-btn"
            onClick={() => router.push('/catalog')}
          >
            <span>Ver todas las categorías</span>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;