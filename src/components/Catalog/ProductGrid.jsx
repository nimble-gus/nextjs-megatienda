        'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import '@/styles/ProductGrid.css';

const ProductGrid = ({ 
  products, 
  loading, 
  currentPage, 
  totalPages, 
  totalProducts, 
  viewMode, 
  sortBy, 
  itemsPerPage, 
  onPageChange, 
  onViewModeChange, 
  onSortChange, 
  onItemsPerPageChange 
}) => {

  // Calcular índices para mostrar información
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalProducts);

  const formatPrice = (price) => {
    if (!price || price === 0) return 'Sin precio';
    return `Q${price.toFixed(2)}`;
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} className={`star ${index < rating ? 'filled' : 'empty'}`}>
        ★
      </span>
    ));
  };

  // Función para obtener la imagen del producto
  const getProductImage = (product) => {
    // Priorizar la imagen principal
    if (product.image) return product.image;
    if (product.url_imagen) return product.url_imagen;
    
    // Si hay imágenes adicionales, usar la primera
    if (product.imagenes && product.imagenes.length > 0) {
      return product.imagenes[0].url_imagen;
    }
    
    // Si hay imágenes adicionales en formato diferente
    if (product.imagenes_adicionales && product.imagenes_adicionales.length > 0) {
      return product.imagenes_adicionales[0];
    }
    
    // Imagen por defecto usando Picsum
    return `https://picsum.photos/300/300?random=${product.id || Math.random()}`;
  };

  // Componente de imagen con manejo de errores
  const ProductImage = ({ product, width = 250, height = 250, className = "product-image" }) => {
    const [imageError, setImageError] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const imageUrl = getProductImage(product);

    const handleImageError = () => {
      if (retryCount < 2) {
        // Intentar con una imagen diferente
        setRetryCount(prev => prev + 1);
        setImageError(false);
      } else {
        setImageError(true);
      }
    };

    if (imageError) {
      return (
        <div className="product-image-placeholder">
          <div className="placeholder-content">
            <svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
            </svg>
            <span>Sin imagen</span>
          </div>
        </div>
      );
    }

    return (
      <Image 
        src={imageUrl} 
        alt={product.name || product.nombre || 'Producto'}
        width={width}
        height={height}
        className={className}
        priority={false}
        onError={handleImageError}
        onLoad={() => {
          setImageError(false);
          setRetryCount(0);
        }}
      />
    );
  };

  // Componente de producto individual
  const ProductCard = ({ product }) => (
    <div className="product-card">
      <Link href={`/product/${product.id}`} className="product-link">
        <div className="product-image-container">
          <ProductImage product={product} />
          <div className="product-overlay">
            <button 
              className="quick-view-btn"
              title="Ver Detalles"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
              </svg>
            </button>
          </div>
        </div>
        
        <div className="product-info">
          <div className="product-brand">{product.categoria || 'Sin categoría'}</div>
          <h3 className="product-name">{product.name || product.nombre || 'Producto sin nombre'}</h3>
          <div className="product-rating">
            {renderStars(product.rating || 0)}
          </div>
          <div className="product-price">
            <span className="current-price">{formatPrice(product.price || product.precio)}</span>
            {product.originalPrice && product.originalPrice > (product.price || product.precio) && (
              <span className="original-price">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );

  // Componente de producto en vista lista
  const ProductListItem = ({ product }) => (
    <div className="product-list-item">
      <div className="product-list-image-section">
        <Link href={`/product/${product.id}`} className="product-link">
          <div className="product-image-container">
            <ProductImage product={product} width={120} height={120} />
          </div>
        </Link>
      </div>
      
      <div className="product-list-info-section">
        <Link href={`/product/${product.id}`} className="product-link">
          <div className="product-info">
            <div className="product-brand">{product.categoria || 'Sin categoría'}</div>
            <h3 className="product-name">{product.name || product.nombre || 'Producto sin nombre'}</h3>
            <div className="product-rating">
              {renderStars(product.rating || 0)}
              <span className="rating-text">({product.rating || 0}/5)</span>
            </div>
            <div className="product-price">
              <span className="current-price">{formatPrice(product.price || product.precio)}</span>
              {product.originalPrice && product.originalPrice > (product.price || product.precio) && (
                <span className="original-price">{formatPrice(product.originalPrice)}</span>
              )}
            </div>
          </div>
        </Link>
      </div>
      
      <div className="product-list-actions-section">
        <div className="product-actions">
          <Link href={`/product/${product.id}`} className="action-btn view-details-btn">
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
            </svg>
            Ver Detalles
          </Link>
        </div>
      </div>
    </div>
  );

  // Componente de paginación
  const Pagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="pagination">
        <button 
          className="pagination-btn prev"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          ←
        </button>
        
        {pages.map(page => (
          <button
            key={page}
            className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}
        
        <button 
          className="pagination-btn next"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          →
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="products-section">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="product-grid-container">
      {/* Barra superior con controles */}
      <div className="products-header">
        <div className="view-controls">
          <button 
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => onViewModeChange('grid')}
            title="Vista de cuadrícula"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z"/>
            </svg>
          </button>
          <button 
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => onViewModeChange('list')}
            title="Vista de lista"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
            </svg>
          </button>
        </div>

        <div className="results-info">
          Mostrando {startIndex}-{endIndex} de {totalProducts} resultados
        </div>

        <div className="sort-controls">
          <select 
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="sort-select"
          >
            <option value="default">Ordenar por defecto</option>
            <option value="price-low">Precio: Menor a Mayor</option>
            <option value="price-high">Precio: Mayor a Menor</option>
            <option value="name-asc">Nombre: A-Z</option>
            <option value="name-desc">Nombre: Z-A</option>
            <option value="rating">Mejor Valorados</option>
          </select>

          <select 
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(parseInt(e.target.value))}
            className="items-select"
          >
            <option value={12}>12 por página</option>
            <option value={24}>24 por página</option>
            <option value={36}>36 por página</option>
          </select>
        </div>
      </div>

      {/* Grid/Lista de productos */}
      <div className={`products-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
        {products.map(product => (
          viewMode === 'list' ? (
            <ProductListItem key={product.id} product={product} />
          ) : (
            <ProductCard key={product.id} product={product} />
          )
        ))}
      </div>

      {/* Paginación */}
      {totalPages > 1 && <Pagination />}
    </div>
  );
};

export default ProductGrid;
