'use client';
import React from 'react';
import '@/styles/ProductInfo.css';

const ProductInfo = ({ 
  product, 
  selectedColor, 
  onColorSelect, 
  quantity, 
  onQuantityChange, 
  onAddToCart, 
  onBuyNow, 
  formatPrice, 
  renderStars,
  isAddingToCart = false
}) => {
  return (
    <div className="product-info">
      {/* Categoría */}
      <div className="product-category">
        {product.category}
      </div>

      {/* Nombre del producto */}
      <h1 className="product-name">
        {product.name}
      </h1>

      {/* Precio */}
      <div className="product-price">
        <span className="current-price">{formatPrice(selectedColor?.price)}</span>
        {product.maxPrice && product.minPrice && product.maxPrice > product.minPrice && (
          <span className="price-range">
            {formatPrice(product.minPrice)} - {formatPrice(product.maxPrice)}
          </span>
        )}
      </div>

      {/* SKU */}
      <div className="product-sku">
        <span className="sku-label">SKU:</span>
        <span className="sku-value">{product.sku}</span>
      </div>

      {/* Descripción corta */}
      <div className="product-description">
        <p>{product.description}</p>
      </div>

      {/* Stock total - OCULTO */}
      {/* <div className="total-stock">
        <span className="stock-icon">📦</span>
        <span>{product.totalStock} unidades disponibles en total</span>
      </div> */}

      {/* Colores disponibles */}
      <div className="color-selection">
        <h3>Color:</h3>
        <div className="color-options">
          {product.colors.map((color) => (
            <button
              key={color.id}
              className={`color-option ${selectedColor.id === color.id ? 'selected' : ''} ${!color.available ? 'unavailable' : ''}`}
              onClick={() => color.available && onColorSelect(color)}
              disabled={!color.available}
              title={`${color.name} (${color.stock} disponibles)`}
            >
              <div 
                className="color-swatch"
                style={{ backgroundColor: color.hex }}
              ></div>
              <span className="color-name">{color.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stock alert - Solo cuando hay 5 o menos productos */}
      {selectedColor?.stock <= 5 && selectedColor?.stock > 0 && (
        <div className="stock-alert">
          <span className="alert-icon">⚠️</span>
          <span>¡Apúrate! Solo {selectedColor.stock} unidades disponibles</span>
        </div>
      )}

      {/* Selector de cantidad */}
      <div className="quantity-selector">
        <h3>Cantidad:</h3>
        <div className="quantity-controls">
          <button 
            className="quantity-btn"
            onClick={() => onQuantityChange(quantity - 1)}
            disabled={quantity <= 1}
          >
            -
          </button>
          <span className="quantity-display">{quantity}</span>
          <button 
            className="quantity-btn"
            onClick={() => onQuantityChange(quantity + 1)}
            disabled={quantity >= (selectedColor?.stock || 0)}
          >
            +
          </button>
        </div>
        {/* Stock info - OCULTO */}
        {/* <span className="stock-info">
          {selectedColor.stock} disponibles
        </span> */}
      </div>

      {/* Botones de acción */}
      <div className="action-buttons">
        <button 
          className="add-to-cart-btn"
          onClick={onAddToCart}
          disabled={selectedColor?.stock === 0 || isAddingToCart}
        >
          <span>{isAddingToCart ? 'Agregando...' : 'Agregar al Carrito'}</span>
          <span className="heart-icon">❤️</span>
        </button>
        
        <button 
          className="buy-now-btn"
          onClick={onBuyNow}
          disabled={selectedColor?.stock === 0 || isAddingToCart}
        >
          {isAddingToCart ? 'Procesando...' : 'Comprar Ahora'}
        </button>
      </div>

      {/* Información del producto */}
      <div className="product-meta">
        <div className="meta-item">
          <span className="meta-label">Categoría:</span>
          <a href={`/catalog?category=${product.category}`} className="meta-link">
            {product.category}
          </a>
        </div>
        
        <div className="meta-item">
          <span className="meta-label">Colores disponibles:</span>
          <span className="meta-value">{product.colors.length} variantes</span>
        </div>
        
        <div className="meta-item">
          <span className="meta-label">Estado:</span>
          <span className={`meta-value ${product.hasStock ? 'in-stock' : 'out-of-stock'}`}>
            {product.hasStock ? 'En stock' : 'Sin stock'}
          </span>
        </div>
      </div>

      {/* Compartir en redes sociales */}
      <div className="social-sharing">
        <button className="share-btn facebook">
          <span>📘</span>
        </button>
        <button className="share-btn linkedin">
          <span>💼</span>
        </button>
        <button className="share-btn generic">
          <span>📤</span>
        </button>
      </div>

      {/* Información de pago seguro */}
      <div className="payment-info">
        <div className="secure-checkout">
          <span className="secure-icon">🔒</span>
          <span>Pago Seguro y Garantizado</span>
        </div>
        
        <div className="payment-methods">
          <span className="payment-method">PayPal</span>
          <span className="payment-method">VISA</span>
          <span className="payment-method">Stripe</span>
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;
