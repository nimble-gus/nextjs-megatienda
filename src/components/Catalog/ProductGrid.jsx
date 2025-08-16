'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { addToCart } from '@/services/cartService';
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
  const [addingToCart, setAddingToCart] = useState({});
  const [cartMessages, setCartMessages] = useState({});

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

  const handleAddToCart = async (product, event) => {
    event.preventDefault();
    event.stopPropagation();

    // Verificar si el usuario está logueado
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) {
      alert('Debes iniciar sesión para agregar productos al carrito');
      return;
    }

    // Verificar si el producto tiene colores disponibles
    if (!product.colors || product.colors.length === 0) {
      alert('Este producto no tiene colores disponibles');
      return;
    }

    // Si tiene múltiples colores, redirigir a la página del producto
    if (product.colors.length > 1) {
      window.location.href = `/product/${product.id}`;
      return;
    }

    // Si solo tiene un color, agregar directamente al carrito
    const selectedColor = product.colors[0];
    
    if (!selectedColor.available) {
      alert('Este producto no está disponible');
      return;
    }

    try {
      setAddingToCart(prev => ({ ...prev, [product.id]: true }));
      setCartMessages(prev => ({ ...prev, [product.id]: '' }));

      const productData = {
        usuario_id: user.id || user.usuario_id,
        producto_id: product.id,
        color_id: selectedColor.id,
        cantidad: 1
      };

      const result = await addToCart(productData);
      
      // Mostrar mensaje de éxito
      setCartMessages(prev => ({ 
        ...prev, 
        [product.id]: result.message 
      }));
      
      // Disparar evento para actualizar contador en el header
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => {
        setCartMessages(prev => {
          const newMessages = { ...prev };
          delete newMessages[product.id];
          return newMessages;
        });
      }, 3000);

    } catch (error) {
      console.error('Error agregando al carrito:', error);
      setCartMessages(prev => ({ 
        ...prev, 
        [product.id]: `Error: ${error.message}` 
      }));
      
      // Limpiar mensaje de error después de 5 segundos
      setTimeout(() => {
        setCartMessages(prev => {
          const newMessages = { ...prev };
          delete newMessages[product.id];
          return newMessages;
        });
      }, 5000);
    } finally {
      setAddingToCart(prev => {
        const newState = { ...prev };
        delete newState[product.id];
        return newState;
      });
    }
  };

  // Componente de producto individual
  const ProductCard = ({ product }) => (
    <div className="product-card">
      <Link href={`/product/${product.id}`} className="product-link">
        <div className="product-image-container">
          {product.image ? (
            <Image 
              src={product.image} 
              alt={product.name}
              width={250}
              height={250}
              className="product-image"
              priority={false}
            />
          ) : (
            <div className="product-image-placeholder">
              <span>Sin imagen</span>
            </div>
          )}
                     <div className="product-overlay">
             <button 
               className="quick-view-btn"
               title="Ver Detalles"
             >
               <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                 <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
               </svg>
             </button>
             <button 
               className="add-to-cart-btn"
               onClick={(e) => handleAddToCart(product, e)}
               disabled={addingToCart[product.id]}
               title="Agregar al Carrito"
             >
               {addingToCart[product.id] ? (
                 <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                   <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                 </svg>
               ) : (
                 <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                   <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                 </svg>
               )}
             </button>
           </div>
        </div>
        
        <div className="product-info">
          <div className="product-brand">{product.brand}</div>
          <h3 className="product-name">{product.name}</h3>
          <div className="product-rating">
            {renderStars(product.rating)}
          </div>
          <div className="product-price">
            <span className="current-price">{formatPrice(product.price)}</span>
            {product.originalPrice > product.price && (
              <span className="original-price">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
        </div>
      </Link>
      
      {/* Mensaje del carrito */}
      {cartMessages[product.id] && (
        <div className={`cart-message ${cartMessages[product.id].includes('Error') ? 'error' : 'success'}`}>
          {cartMessages[product.id]}
        </div>
      )}
    </div>
  );

  // Componente de producto en vista lista
  const ProductListItem = ({ product }) => (
    <div className="product-list-item">
      <Link href={`/product/${product.id}`} className="product-link">
        <div className="product-image-container">
          {product.image ? (
            <Image 
              src={product.image} 
              alt={product.name}
              width={100}
              height={100}
              className="product-image"
              priority={false}
            />
          ) : (
            <div className="product-image-placeholder">
              <span>Sin imagen</span>
            </div>
          )}
        </div>
        
        <div className="product-info">
          <div className="product-brand">{product.brand}</div>
          <h3 className="product-name">{product.name}</h3>
          <div className="product-rating">
            {renderStars(product.rating)}
          </div>
          <div className="product-price">
            <span className="current-price">{formatPrice(product.price)}</span>
            {product.originalPrice > product.price && (
              <span className="original-price">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
        </div>
      </Link>
      
      <div className="product-actions">
        <button className="quick-view-btn">Ver Detalles</button>
        <button 
          className="add-to-cart-btn"
          onClick={(e) => handleAddToCart(product, e)}
          disabled={addingToCart[product.id]}
        >
          {addingToCart[product.id] ? 'Agregando...' : 'Agregar al Carrito'}
        </button>
      </div>
      
      {/* Mensaje del carrito */}
      {cartMessages[product.id] && (
        <div className={`cart-message ${cartMessages[product.id].includes('Error') ? 'error' : 'success'}`}>
          {cartMessages[product.id]}
        </div>
      )}
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
