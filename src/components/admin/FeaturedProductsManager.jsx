'use client';
import React, { useState, useEffect } from 'react';
import '@/styles/FeaturedProductsManager.css';

const FeaturedProductsManager = () => {
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Cargar productos y productos destacados
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Cargar todos los productos
        const productsResponse = await fetch('/api/admin/products');
        const productsData = await productsResponse.json();
        
        // Cargar productos destacados
        const featuredResponse = await fetch('/api/featured-products');
        const featuredData = await featuredResponse.json();
        
        if (productsData.success) {
          setProducts(productsData.products);
        }
        
        if (featuredData.success) {
          setFeaturedProducts(featuredData.products);
        }
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const toggleFeatured = async (productId, isFeatured) => {
    try {
      setSaving(true);
      
      const response = await fetch(`/api/admin/products/${productId}/featured`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ featured: !isFeatured }),
      });

      if (response.ok) {
        // Actualizar estado local
        setProducts(prev => 
          prev.map(product => 
            product.id === productId 
              ? { ...product, featured: !isFeatured }
              : product
          )
        );
        
        // Recargar productos destacados
        const featuredResponse = await fetch('/api/featured-products');
        const featuredData = await featuredResponse.json();
        if (featuredData.success) {
          setFeaturedProducts(featuredData.products);
        }
      }
    } catch (error) {
      console.error('Error actualizando producto destacado:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="featured-manager">
        <h3>Gestionar Productos Destacados</h3>
        <div className="loading">Cargando productos...</div>
      </div>
    );
  }

  return (
    <div className="featured-manager">
      <h3>🔥 Gestionar Productos Destacados</h3>
      
      <div className="featured-stats">
        <div className="stat-card">
          <span className="stat-number">{featuredProducts.length}</span>
          <span className="stat-label">Productos Destacados</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{products.length}</span>
          <span className="stat-label">Total Productos</span>
        </div>
      </div>

      <div className="featured-section">
        <h4>Productos Actualmente Destacados</h4>
        {featuredProducts.length > 0 ? (
          <div className="featured-grid">
            {featuredProducts.map(product => (
              <div key={product.id} className="featured-item">
                <div className="product-info">
                  <img 
                    src={product.thumbnailImage || product.image || '/assets/placeholder.jpg'} 
                    alt={product.name}
                    className="product-image"
                  />
                  <div className="product-details">
                    <h5>{product.name}</h5>
                    <p className="category">{product.category}</p>
                    <p className="price">{product.priceFormatted}</p>
                    {product.destacado && (
                      <p className="advanced-info">
                        Orden: {product.destacado.orden} | 
                        Activo: {product.destacado.activo ? 'Sí' : 'No'}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  className="btn-remove-featured"
                  onClick={() => toggleFeatured(product.id, true)}
                  disabled={saving}
                >
                  {saving ? 'Guardando...' : 'Quitar Destacado'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-featured">No hay productos destacados</p>
        )}
      </div>

      <div className="products-section">
        <h4>Marcar Productos como Destacados</h4>
        <div className="products-grid">
          {products
            .filter(product => !product.featured)
            .map(product => (
              <div key={product.id} className="product-item">
                <div className="product-info">
                  <img 
                    src={product.thumbnailImage || product.image || '/assets/placeholder.jpg'} 
                    alt={product.name}
                    className="product-image"
                  />
                  <div className="product-details">
                    <h5>{product.name}</h5>
                    <p className="category">{product.category}</p>
                    <p className="price">{product.priceFormatted}</p>
                    <p className="stock">
                      Stock: {product.hasStock ? `${product.totalStock} unidades` : 'Sin stock'}
                    </p>
                  </div>
                </div>
                <button
                  className="btn-add-featured"
                  onClick={() => toggleFeatured(product.id, false)}
                  disabled={saving || !product.hasStock}
                >
                  {saving ? 'Guardando...' : 'Marcar como Destacado'}
                </button>
              </div>
            ))}
        </div>
      </div>

      <div className="featured-tips">
        <h4>💡 Consejos para Productos Destacados</h4>
        <ul>
          <li>Selecciona productos con buen stock para evitar decepciones</li>
          <li>Prioriza productos de alta calidad y buenas reseñas</li>
          <li>Rota los productos destacados regularmente</li>
          <li>Considera productos de temporada o promocionales</li>
        </ul>
      </div>
    </div>
  );
};

export default FeaturedProductsManager;
