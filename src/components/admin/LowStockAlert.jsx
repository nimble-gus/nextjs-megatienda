'use client';
import React, { useState, useEffect } from 'react';
import '@/styles/LowStockAlert.css';

const LowStockAlert = () => {
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLowStockProducts();
  }, []);

  const fetchLowStockProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/products/low-stock');
      const data = await response.json();
      
      if (data.success) {
        setLowStockProducts(data.products);
      }
    } catch (error) {
      console.error('Error fetching low stock products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="low-stock-card">
        <div className="card-header">
          <h3>⚠️ Alerta de Inventario</h3>
          <span className="alert-count">...</span>
        </div>
        <div className="loading">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="low-stock-card">
              <div className="card-header">
          <div>
            <h3>⚠️ Alerta de Inventario</h3>
            <small style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              Stock bajo (&lt;10) o agotado
            </small>
          </div>
          <span className="alert-count">{lowStockProducts.length}</span>
        </div>
      
      {lowStockProducts.length > 0 ? (
        <div className="low-stock-list">
          {lowStockProducts.slice(0, 5).map(product => (
            <div key={product.id} className="low-stock-item">
              <div className="product-info">
                <img 
                  src={product.url_imagen || '/assets/placeholder.jpg'} 
                  alt={product.nombre}
                  className="product-image"
                />
                                  <div className="product-details">
                    <h4>{product.nombre}</h4>
                    <p className="category">{product.categoria}</p>
                    <p className="stock-warning">
                      {product.totalStock === 0 ? (
                        <span className="out-of-stock">Sin stock</span>
                      ) : (
                        <>Stock: <span className="low-stock">{product.totalStock} unidades</span></>
                      )}
                    </p>
                  </div>
              </div>
              <div className="stock-colors">
                {product.stockDetails.map(stock => (
                  <div key={stock.id} className="color-stock">
                    <div 
                      className="color-dot" 
                      style={{ backgroundColor: stock.color.codigo_hex }}
                    ></div>
                    <span className="stock-amount">{stock.cantidad}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {lowStockProducts.length > 5 && (
            <div className="more-items">
              <p>+{lowStockProducts.length - 5} productos más con stock bajo</p>
            </div>
          )}
        </div>
      ) : (
        <div className="no-alerts">
          <p>✅ Todo el inventario está en buen nivel (stock ≥ 10 unidades)</p>
        </div>
      )}
      
      <div className="card-footer">
        <button 
          className="view-all-btn"
          onClick={() => window.location.href = '/admin?tab=products'}
        >
          Ver todos los productos
        </button>
      </div>
    </div>
  );
};

export default LowStockAlert;
