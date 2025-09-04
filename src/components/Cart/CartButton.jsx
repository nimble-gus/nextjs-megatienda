import React, { useState, useEffect, useCallback } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useClientAuth } from '@/contexts/ClientAuthContext';
import { ShoppingCart, Trash2, Plus, Minus, Package } from 'lucide-react';
import Link from 'next/link';
import '@/styles/CartButton.css';

const CartButton = () => {
  const { cartItems, itemCount, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const { isAuthenticated } = useClientAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Cerrar dropdown cuando se hace click fuera
  const handleClickOutside = useCallback((event) => {
    if (showDropdown && !event.target.closest('.cart-button-container')) {
      setShowDropdown(false);
    }
  }, [showDropdown]);

  // Agregar event listener para clicks fuera del dropdown
  useEffect(() => {
    if (showDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showDropdown, handleClickOutside]);

  // Formatear precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    }).format(price);
  };

  // Manejar cambio de cantidad
  const handleQuantityChange = (itemId, newQuantity) => {
    updateQuantity(itemId, newQuantity);
  };

  // Manejar eliminación de item
  const handleRemoveItem = (itemId) => {
    removeFromCart(itemId);
  };

  // Manejar limpieza del carrito
  const handleClearCart = () => {
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
      clearCart();
      setShowDropdown(false);
    }
  };

  // Si no está autenticado, no mostrar el botón del carrito
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="cart-button-container">
      <button 
        className="cart-button"
        onClick={toggleDropdown}
        title="Ver carrito de compras"
      >
        <ShoppingCart size={18} />
        <span className="cart-text">Carrito</span>
        
        {/* Badge con cantidad de items - siempre visible */}
        <span className="cart-badge">
          {itemCount > 0 ? (itemCount > 99 ? '99+' : itemCount) : ''}
        </span>
      </button>

      {/* Dropdown del carrito */}
      {showDropdown && (
        <div className="cart-dropdown">
          <div className="cart-dropdown-header">
            <h3>Carrito de Compras</h3>
            {cartItems.length > 0 && (
              <button 
                className="clear-cart-btn"
                onClick={handleClearCart}
                title="Vaciar carrito"
              >
                <Trash2 size={16} />
                <span>Vaciar</span>
              </button>
            )}
          </div>

          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <Package size={48} />
              <p>Tu carrito está vacío</p>
              <span>Agrega productos para comenzar</span>
            </div>
          ) : (
            <>
              {/* Lista de items */}
              <div className="cart-items-list">
                {cartItems.map((item) => (
                  <div key={item.id} className="cart-item">
                    <div className="item-image">
                      {item.producto.url_imagen ? (
                        <img 
                          src={item.producto.url_imagen} 
                          alt={item.producto.nombre}
                          width={40}
                          height={40}
                        />
                      ) : (
                        <div className="item-placeholder">
                          <Package size={20} />
                        </div>
                      )}
                    </div>

                    <div className="item-details">
                      <div className="item-name">{item.producto.nombre}</div>
                      <div className="item-sku">SKU: {item.producto.sku}</div>
                      <div className="item-color">
                        <span 
                          className="color-swatch" 
                          style={{ backgroundColor: item.color.codigo_hex }}
                        ></span>
                        <span>{item.color.nombre}</span>
                      </div>
                    </div>

                    <div className="item-price">
                      {formatPrice(item.precio)}
                    </div>

                    <div className="item-quantity">
                      <div className="quantity-controls">
                        <button
                          className="quantity-btn"
                          onClick={() => handleQuantityChange(item.id, item.cantidad - 1)}
                          disabled={item.cantidad <= 1}
                        >
                          <Minus size={12} />
                        </button>
                        <span className="quantity-value">{item.cantidad}</span>
                        <button
                          className="quantity-btn"
                          onClick={() => handleQuantityChange(item.id, item.cantidad + 1)}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>

                    <div className="item-total">
                      {formatPrice(item.precio * item.cantidad)}
                    </div>

                    <button
                      className="remove-item-btn"
                      onClick={() => handleRemoveItem(item.id)}
                      title="Eliminar item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Resumen del carrito */}
              <div className="cart-summary">
                <div className="summary-row">
                  <span>Total ({itemCount} items):</span>
                  <span className="total-amount">{formatPrice(cartTotal)}</span>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="cart-actions">
                <Link href="/cart" className="view-cart-btn">
                  Ver Carrito Completo
                </Link>
                <Link href="/checkout" className="checkout-btn">
                  Proceder al Pago
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CartButton;
