'use client';
import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useFeaturedProducts } from '@/hooks/useHomeData';
import '../../styles/FeaturedProducts.css';

export default function FeaturedProducts() {
  const router = useRouter();
  const { featuredProducts, loading, error } = useFeaturedProducts();

  const handleViewDetails = (id) => {
    router.push(`/product/${id}`);
  };

  // Mostrar loading
  if (loading) {
    return (
      <section className="featured-section">
        <div className="featured-container">
          <h2 className="featured-title">🔥 Productos Destacados</h2>
          <div className="featured-grid">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="featured-card loading">
                <div className="featured-img-wrapper loading-img"></div>
                <div className="featured-info">
                  <div className="loading-title"></div>
                  <div className="loading-price"></div>
                  <div className="loading-button"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Mostrar error
  if (error) {
    return (
      <section className="featured-section">
        <div className="featured-container">
          <h2 className="featured-title">🔥 Productos Destacados</h2>
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Reintentar</button>
          </div>
        </div>
      </section>
    );
  }

  // Mostrar productos
  return (
    <section className="featured-section">
      <div className="featured-container">
        <h2 className="featured-title">🔥 Productos Destacados</h2>
        {featuredProducts.length > 0 ? (
          <div className="featured-grid">
            {featuredProducts.map((prod) => (
              <div key={prod.id} className="featured-card">
                <div className="featured-img-wrapper">
                  {/* Mostrar imagen si existe, sino mostrar placeholder */}
                  {prod.thumbnailImage || prod.image ? (
                    <Image
                      src={prod.thumbnailImage || prod.image}
                      alt={prod.name}
                      width={300}
                      height={300}
                      className="featured-img"
                      onError={(e) => {
                        // Si la imagen falla, mostrar placeholder
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  {/* Placeholder por defecto */}
                  <div 
                    className="featured-img-placeholder"
                    style={{
                      width: '300px',
                      height: '300px',
                      backgroundColor: '#f8f9fa',
                      display: !prod.thumbnailImage && !prod.image ? 'flex' : 'none',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #e9ecef',
                      borderRadius: '8px'
                    }}
                  >
                    <span style={{ color: '#495057', fontSize: '14px', textAlign: 'center' }}>
                      {prod.name}
                    </span>
                  </div>
                  {prod.featured && (
                    <div className="featured-badge">
                      <span>⭐ Destacado</span>
                    </div>
                  )}
                </div>
                <div className="featured-info">
                  <h3>{prod.name}</h3>
                  <p className="category">{prod.category}</p>
                  <p className="precio">{prod.priceFormatted}</p>
                  {!prod.hasStock && (
                    <p className="out-of-stock">Sin stock</p>
                  )}
                  <button
                    className="btn-detalles"
                    onClick={() => handleViewDetails(prod.id)}
                    disabled={!prod.hasStock}
                  >
                    {prod.hasStock ? 'Ver Detalles' : 'Sin Stock'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-featured">
            <p>No hay productos destacados disponibles</p>
          </div>
        )}
      </div>
    </section>
  );
}
