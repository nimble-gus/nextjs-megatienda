'use client';
import React, { useState } from 'react';
import '@/styles/CartSummary.css';

const CartSummary = ({ items, onCheckout }) => {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const formatPrice = (price) => {
    return `Q${price.toFixed(2)}`;
  };

  // Calcular totales
  const subtotal = items.reduce((total, item) => {
    return total + (item.precio * item.cantidad);
  }, 0);

  const discount = appliedCoupon ? (subtotal * appliedCoupon.discount) / 100 : 0;
  const total = subtotal - discount;

  const handleApplyCoupon = () => {
    if (couponCode.trim()) {
      // Aquí implementarías la lógica para validar cupones
      // Por ahora, simulamos un cupón del 10%
      setAppliedCoupon({
        code: couponCode,
        discount: 10
      });
      setCouponCode('');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
  };

  const handleCheckout = () => {
    if (items.length > 0) {
      onCheckout();
    }
  };

  return (
    <div className="cart-summary">
      <div className="summary-header">
        <h3>Resumen del Pedido</h3>
      </div>

      <div className="summary-content">
        {/* Cupón - OCULTO TEMPORALMENTE */}
        {/* 
        <div className="coupon-section">
          <label htmlFor="coupon-code">Cupón de Descuento:</label>
          <div className="coupon-input-group">
            <input
              type="text"
              id="coupon-code"
              placeholder="Ingresa tu código de cupón"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              disabled={appliedCoupon !== null}
            />
            {!appliedCoupon ? (
              <button 
                className="apply-coupon-btn"
                onClick={handleApplyCoupon}
                disabled={!couponCode.trim()}
              >
                Aplicar
              </button>
            ) : (
              <button 
                className="remove-coupon-btn"
                onClick={handleRemoveCoupon}
              >
                Remover
              </button>
            )}
          </div>
          {appliedCoupon && (
            <div className="applied-coupon">
              <span className="coupon-code">{appliedCoupon.code}</span>
              <span className="coupon-discount">-{appliedCoupon.discount}%</span>
            </div>
          )}
        </div>
        */}

        {/* Resumen de precios */}
        <div className="price-summary">
          <div className="summary-row">
            <span className="summary-label">Subtotal:</span>
            <span className="summary-value">{formatPrice(subtotal)}</span>
          </div>

          {appliedCoupon && (
            <div className="summary-row discount-row">
              <span className="summary-label">Descuento ({appliedCoupon.code}):</span>
              <span className="summary-value discount-value">
                -{formatPrice(discount)}
              </span>
            </div>
          )}

          <div className="summary-row total-row">
            <span className="summary-label">Total:</span>
            <span className="summary-value total-value">{formatPrice(total)}</span>
          </div>
        </div>

        {/* Información adicional */}
        <div className="summary-info">
          <div className="info-item">
            <span className="info-icon">🚚</span>
            <span className="info-text">Envío gratuito</span>
          </div>
          <div className="info-item">
            <span className="info-icon">🛡️</span>
            <span className="info-text">Pago seguro</span>
          </div>
        </div>

        {/* Botón de checkout */}
        <div className="checkout-section">
          <button
            className="checkout-btn"
            onClick={handleCheckout}
            disabled={items.length === 0}
          >
            Checkout
          </button>
          
          <button className="update-cart-btn">
            <span className="update-icon">🔄</span>
            Actualizar Carrito
          </button>
        </div>

        {/* Métodos de pago */}
        <div className="payment-methods">
          <h4>Métodos de Pago Aceptados</h4>
          <div className="payment-icons">
            <div className="payment-method" title="Tarjeta de Crédito">
              <span className="payment-icon">💳</span>
            </div>
            <div className="payment-method" title="Transferencia Bancaria">
              <span className="payment-icon">🏦</span>
            </div>
            <div className="payment-method" title="Pago Contra Entrega">
              <span className="payment-icon">📦</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;
