'use client';

import '@/styles/ProductInfo.css';

const ProductInfo = ({ 
  product, 
  selectedColor, 
  onColorSelect, 
  quantity, 
  onQuantityChange, 
  onBuyNow,
  onAddToCart,
  isAuthenticated,
  isAddingToCart,
  formatPrice, 
  renderStars
}) => {

  return (
    <div className="product-info-modern">
      {/* Header minimalista */}
      <div className="product-header">
        <div className="product-category-minimal">
          {product.category}
        </div>
        <h1 className="product-title">
          {product.name}
        </h1>
        <div className="product-rating-minimal">
          {renderStars(4.5)}
          <span className="rating-text">(128 reseñas)</span>
        </div>
      </div>

      {/* Precio destacado */}
      <div className="product-pricing">
        <div className="price-main">
          <span className="price-current">{formatPrice(selectedColor?.price)}</span>
          {product.maxPrice && product.minPrice && product.maxPrice > product.minPrice && (
            <span className="price-range-minimal">
              {formatPrice(product.minPrice)} - {formatPrice(product.maxPrice)}
            </span>
          )}
        </div>
        <div className="price-details">
          <span className="sku-minimal">{product.sku}</span>
        </div>
      </div>

      {/* Descripción elegante */}
      <div className="product-description-minimal">
        <p>{product.description}</p>
      </div>

      {/* Selección de color moderna */}
      <div className="color-selection-modern">
        <div className="color-label">
          <span>Color</span>
          <span className="color-selected">{selectedColor?.name}</span>
        </div>
        <div className="color-grid">
          {product.colors.map((color) => (
            <button
              key={color.id}
              className={`color-option-modern ${selectedColor?.id === color.id ? 'selected' : ''} ${!color.available ? 'unavailable' : ''}`}
              onClick={() => color.available && onColorSelect(color)}
              disabled={!color.available}
              title={color.name}
            >
              <div 
                className="color-swatch-modern"
                style={{ backgroundColor: color.hex }}
              ></div>
            </button>
          ))}
        </div>
      </div>

      {/* Stock y cantidad */}
      <div className="stock-quantity-modern">
        {/* Stock alert */}
        {selectedColor?.stock <= 5 && selectedColor?.stock > 0 && (
          <div className="stock-alert-modern">
            <div className="alert-icon">⚠️</div>
            <span>Solo {selectedColor.stock} unidades disponibles</span>
          </div>
        )}

        {/* Selector de cantidad */}
        <div className="quantity-modern">
          <span className="quantity-label">Cantidad</span>
          <div className="quantity-controls-modern">
            <button 
              className="quantity-btn-modern"
              onClick={() => onQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13H5v-2h14v2z"/>
              </svg>
            </button>
            <span className="quantity-display-modern">{quantity}</span>
            <button 
              className="quantity-btn-modern"
              onClick={() => onQuantityChange(quantity + 1)}
              disabled={quantity >= (selectedColor?.stock || 0)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Botones de acción modernos */}
      <div className="action-buttons-modern">
        {isAuthenticated ? (
          <button 
            className="btn-primary-modern"
            onClick={onAddToCart}
            disabled={selectedColor?.stock === 0 || isAddingToCart}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z"/>
            </svg>
            {isAddingToCart ? 'Agregando...' : 'Agregar al carrito'}
          </button>
        ) : (
          <button 
            className="btn-secondary-modern"
            onClick={onBuyNow}
            disabled={selectedColor?.stock === 0}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 18C5.9 18 5.01 18.9 5.01 20S5.9 22 7 22 9 21.1 9 20 8.1 18 7 18ZM1 2V4H3L6.6 11.59L5.25 14.04C5.09 14.32 5 14.65 5 15C5 16.1 5.9 17 7 17H19V15H7.42C7.28 15 7.17 14.89 7.17 14.75L7.2 14.63L8.1 13H15.55C16.3 13 16.96 12.59 17.3 11.97L20.88 5H5.21L4.27 3H1V2ZM17 18C15.9 18 15.01 18.9 15.01 20S15.9 22 17 22 19 21.1 19 20 18.1 18 17 18Z"/>
            </svg>
            Comprar Ahora
          </button>
        )}
      </div>

      {/* Información adicional minimalista */}
      <div className="product-meta-modern">
        <div className="meta-grid">
          <div className="meta-item-modern">
            <span className="meta-icon">📦</span>
            <span className="meta-text">{selectedColor?.stock || 0} disponibles</span>
          </div>
          <div className="meta-item-modern">
            <span className="meta-icon">🚚</span>
            <span className="meta-text">Envío gratis</span>
          </div>
          <div className="meta-item-modern">
            <span className="meta-icon">🔄</span>
            <span className="meta-text">Devolución 30 días</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;
