'use client';
import React from 'react';
import Image from 'next/image';
import '@/styles/CartItems.css';

const CartItems = ({ items, onUpdateQuantity, onRemoveItem, onClearCart }) => {
  const formatPrice = (price) => {
    return `Q${price.toFixed(2)}`;
  };

  const handleQuantityChange = (itemId, newQuantity, stockDisponible) => {
    // Debug: mostrar información de validación
    console.log('Validando cantidad:', {
      itemId,
      newQuantity,
      stockDisponible,
      isValid: newQuantity >= 1 && newQuantity <= stockDisponible
    });
    
    // Validación optimizada en el frontend
    if (newQuantity < 1) {
      alert('La cantidad mínima es 1.');
      return;
    }
    
    // Permitir que el usuario ajuste su cantidad actual, pero no exceder el stock total
    if (newQuantity > stockDisponible) {
      alert(`Solo hay ${stockDisponible} unidades disponibles de este producto.`);
      return;
    }
    
    // Si pasa todas las validaciones, actualizar la cantidad
    onUpdateQuantity(itemId, newQuantity);
  };

  // Función para calcular stock disponible real (considerando otros items del carrito)
  const getStockDisponibleReal = (item) => {
    const stockBase = item.stockDisponible || 0;
    
    // Buscar otros items del mismo producto y color en el carrito (excluyendo el actual)
    const otrosItems = items.filter(otherItem => 
      otherItem.id !== item.id && 
      otherItem.producto?.id === item.producto?.id &&
      otherItem.color?.id === item.color?.id
    );
    
    const cantidadEnOtrosItems = otrosItems.reduce((total, otherItem) => 
      total + (otherItem.cantidad || 0), 0
    );
    
    // Stock disponible = stock base - cantidad en otros items
    // El item actual puede usar todo el stock disponible + su cantidad actual
    const stockDisponible = stockBase - cantidadEnOtrosItems;
    
    // Debug: mostrar información del cálculo
    console.log('Cálculo de stock disponible:', {
      itemId: item.id,
      productoId: item.producto?.id,
      colorId: item.color?.id,
      stockBase,
      cantidadEnOtrosItems,
      stockDisponible: Math.max(0, stockDisponible)
    });
    
    return Math.max(0, stockDisponible);
  };

  if (items.length === 0) {
    return (
      <div className="cart-items">
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <h2>Tu carrito está vacío</h2>
          <p>No tienes productos en tu carrito de compras.</p>
          <a href="/catalog" className="continue-shopping-btn">
            Continuar Comprando
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-items">
      <div className="cart-items-actions">
        <button 
          className="clear-cart-btn"
          onClick={onClearCart}
        >
          Limpiar Carrito
        </button>
      </div>

      <div className="cart-items-table">

        <div className="cart-items-list">
          {items.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="item-product">
                <div className="product-image">
                  {item.producto?.url_imagen ? (
                    <Image
                      src={item.producto.url_imagen}
                      alt={item.producto.nombre}
                      width={80}
                      height={80}
                      className="product-img"
                    />
                  ) : (
                    <div className="product-placeholder">
                      <span>Sin imagen</span>
                    </div>
                  )}
                </div>
                <div className="product-info">
                  <h3 className="product-name">{item.producto?.nombre || 'Producto no disponible'}</h3>
                  <p className="product-sku">SKU: {item.producto?.sku || 'N/A'}</p>
                  {item.color && (
                    <div className="product-color">
                      <span 
                        className="color-swatch"
                        style={{ backgroundColor: item.color.codigo_hex }}
                        title={item.color.nombre}
                      ></span>
                      <span className="color-name">{item.color.nombre}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="item-price">
                <span className="price-amount">
                  {formatPrice(item.precio)}
                </span>
              </div>

                             <div className="item-quantity">
                 <div className="quantity-controls">
                   <button
                     className="quantity-btn minus"
                     onClick={() => handleQuantityChange(item.id, item.cantidad - 1, getStockDisponibleReal(item))}
                     disabled={item.cantidad <= 1}
                   >
                     -
                   </button>
                   <span className="quantity-display">{item.cantidad}</span>
                   <button
                     className="quantity-btn plus"
                     onClick={() => handleQuantityChange(item.id, item.cantidad + 1, getStockDisponibleReal(item))}
                     disabled={item.cantidad >= getStockDisponibleReal(item)}
                   >
                     +
                   </button>
                 </div>
               </div>

              <div className="item-total">
                <span className="total-amount">
                  {formatPrice(item.precio * item.cantidad)}
                </span>
              </div>

              <div className="item-actions">
                <button
                  className="remove-item-btn"
                  onClick={() => onRemoveItem(item.id)}
                  title="Eliminar producto"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="cart-items-footer">
        <div className="cart-summary-info">
          <span className="total-items">
            {items.length} producto{items.length !== 1 ? 's' : ''} en el carrito
          </span>
        </div>
      </div>
    </div>
  );
};

export default CartItems;
