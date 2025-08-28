'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import '@/styles/CartItems.css';

const CartItems = ({ items, onUpdateQuantity, onRemoveItem, onClearCart }) => {
  const [isStable, setIsStable] = useState(false);
  const [stableItems, setStableItems] = useState([]);
  const containerRef = useRef(null);

  // Ordenar items por ID para mantener consistencia
  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => a.id - b.id);
  }, [items]);

  // Efecto para estabilizar el renderizado
  useEffect(() => {
    if (sortedItems.length > 0) {
      // Usar requestAnimationFrame para sincronizar con el ciclo de renderizado
      const rafId = requestAnimationFrame(() => {
        setStableItems(sortedItems);
        setIsStable(true);
      });
      
      return () => cancelAnimationFrame(rafId);
    } else {
      setStableItems([]);
      setIsStable(false);
    }
  }, [sortedItems]);

  // Efecto para forzar el reflow después de que se estabilice
  useEffect(() => {
    if (isStable && containerRef.current) {
      // Forzar un reflow para asegurar que el layout esté estable
      containerRef.current.offsetHeight;
    }
  }, [isStable]);

  const formatPrice = (price) => {
    return `Q${price.toFixed(2)}`;
  };

  const handleQuantityChange = (itemId, newQuantity, stockDisponible) => {
    if (newQuantity < 1) {
      alert('La cantidad mínima es 1.');
      return;
    }
    
    if (newQuantity > stockDisponible) {
      alert(`Solo hay ${stockDisponible} unidades disponibles de este producto.`);
      return;
    }
    
    onUpdateQuantity(itemId, newQuantity);
  };

  const getStockDisponibleReal = (item) => {
    const stockBase = item.stockDisponible || 0;
    
    const otrosItems = stableItems.filter(otherItem => 
      otherItem.id !== item.id && 
      otherItem.producto?.id === item.producto?.id &&
      otherItem.color?.id === item.color?.id
    );
    
    const cantidadEnOtrosItems = otrosItems.reduce((total, otherItem) => 
      total + (otherItem.cantidad || 0), 0
    );
    
    const stockDisponible = stockBase - cantidadEnOtrosItems;
    
    return Math.max(0, stockDisponible);
  };

  // Mostrar carrito vacío
  if (items.length === 0) {
    return (
      <div className="cart-items-container" ref={containerRef}>
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

  // Mostrar skeleton loading mientras se estabiliza
  if (!isStable || stableItems.length === 0) {
    return (
      <div className="cart-items-container" ref={containerRef}>
        <div className="cart-header">
          <button className="clear-cart-btn" disabled>
            Limpiar Carrito
          </button>
        </div>
        <div className="cart-items-list">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="cart-item-skeleton">
              <div className="skeleton-product">
                <div className="skeleton-image"></div>
                <div className="skeleton-info">
                  <div className="skeleton-title"></div>
                  <div className="skeleton-sku"></div>
                  <div className="skeleton-color"></div>
                </div>
              </div>
              <div className="skeleton-price"></div>
              <div className="skeleton-quantity"></div>
              <div className="skeleton-total"></div>
              <div className="skeleton-remove"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="cart-items-container" ref={containerRef}>
      <div className="cart-header">
        <button 
          className="clear-cart-btn"
          onClick={onClearCart}
        >
          Limpiar Carrito
        </button>
      </div>

      <div className="cart-items-list">
        {stableItems.map((item) => (
          <div key={item.id} className="cart-item">
            <div className="cart-item-product">
              <div className="product-image-container">
                {item.producto?.url_imagen ? (
                  <Image
                    src={item.producto.url_imagen}
                    alt={item.producto.nombre}
                    width={80}
                    height={80}
                    className="product-image"
                  />
                ) : (
                  <div className="product-placeholder">
                    <span>Sin imagen</span>
                  </div>
                )}
              </div>
              <div className="product-details">
                <h3 className="product-name">
                  {item.producto?.nombre || 'Producto no disponible'}
                </h3>
                <p className="product-sku">
                  {item.producto?.sku || 'N/A'}
                </p>
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

            <div className="cart-item-price">
              <span className="price-amount">
                {formatPrice(item.precio)}
              </span>
            </div>

            <div className="cart-item-quantity">
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

            <div className="cart-item-total">
              <span className="total-amount">
                {formatPrice(item.precio * item.cantidad)}
              </span>
            </div>

            <div className="cart-item-actions">
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

      <div className="cart-footer">
        <div className="cart-summary">
          <span className="total-items">
            {stableItems.length} producto{stableItems.length !== 1 ? 's' : ''} en el carrito
          </span>
        </div>
      </div>
    </div>
  );
};

export default CartItems;
