'use client';

import { useCart } from '@/contexts/CartContext';
import { useClientAuth } from '@/contexts/ClientAuthContext';
import { useState } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, Package, Gift } from 'lucide-react';
import Link from 'next/link';
import Topbar from '@/components/layout/Topbar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import '@/styles/CartPage.css';

const CartPage = () => {
  const { cartItems, cartTotal, updateQuantity, removeFromCart, clearCart, isLoading } = useCart();
  const { isAuthenticated } = useClientAuth();
  const [shippingOption, setShippingOption] = useState('free-shipping');
  const [shippingCost, setShippingCost] = useState(0);

  // Calcular totales
  const subtotal = cartTotal;
  const total = subtotal + shippingCost;

  // Manejar cambio de cantidad
  const handleQuantityChange = async (itemId, newQuantity) => {
    try {
      await updateQuantity(itemId, newQuantity);
    } catch (error) {
      console.error('Error actualizando cantidad:', error);
    }
  };

  // Manejar eliminación de item
  const handleRemoveItem = async (itemId) => {
    try {
      await removeFromCart(itemId);
    } catch (error) {
      console.error('Error removiendo item:', error);
    }
  };

  // Manejar cambio de opción de envío
  const handleShippingChange = (option) => {
    setShippingOption(option);
    setShippingCost(0); // Siempre envío gratis
  };

  // Formatear precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <div className="loading-state">
            <Package size={48} className="loading-icon" />
            <p>Cargando carrito...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      {/* Header */}
      <div className="sticky-wrapper">
        <Topbar />
        <Header />
      </div>

      <div className="cart-container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link href="/">Inicio</Link>
          <span>›</span>
          <span>Carrito de Compras</span>
        </div>

        {/* Título */}
        <div className="page-header">
          <h1>Carrito de Compras</h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="empty-cart-state">
            <ShoppingCart size={64} />
            <h2>Tu carrito está vacío</h2>
            <p>Agrega algunos productos para comenzar tu compra</p>
            <Link href="/catalog" className="continue-shopping-btn">
              Continuar Comprando
            </Link>
          </div>
        ) : (
          <div className="cart-content">
            {/* Sección principal - Lista de productos */}
            <div className="cart-main">
              {/* Tabla de productos */}
              <div className="cart-table">
                <div className="table-header">
                  <div className="col-product">Producto</div>
                  <div className="col-price">Precio</div>
                  <div className="col-quantity">Cantidad</div>
                  <div className="col-total">Total</div>
                  <div className="col-actions">Acciones</div>
                </div>

                <div className="table-body">
                  {cartItems.map((item) => (
                    <div key={item.id} className="cart-item-row">
                      <div className="col-product">
                        <div className="product-info">
                          <div className="product-image">
                            {item.producto.url_imagen ? (
                              <img 
                                src={item.producto.url_imagen} 
                                alt={item.producto.nombre}
                                width={80}
                                height={80}
                              />
                            ) : (
                              <div className="image-placeholder">
                                <Package size={32} />
                              </div>
                            )}
                          </div>
                          <div className="product-details">
                            <h3 className="product-name">{item.producto.nombre}</h3>
                            <p className="product-sku"> {item.producto.sku}</p>
                            <div className="product-color">
                              <span 
                                className="color-swatch" 
                                style={{ backgroundColor: item.color.codigo_hex }}
                              ></span>
                              <span>{item.color.nombre}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-price">
                        <span className="price">{formatPrice(item.precio)}</span>
                      </div>

                      <div className="col-quantity">
                        <div className="quantity-controls">
                          <button
                            className="quantity-btn"
                            onClick={() => handleQuantityChange(item.id, item.cantidad - 1)}
                            disabled={item.cantidad <= 1}
                          >
                            <Minus size={16} />
                          </button>
                          <input
                            type="number"
                            value={item.cantidad}
                            onChange={(e) => {
                              const newQuantity = parseInt(e.target.value) || 1;
                              if (newQuantity >= 1) {
                                handleQuantityChange(item.id, newQuantity);
                              }
                            }}
                            className="quantity-input"
                            min="1"
                          />
                          <button
                            className="quantity-btn"
                            onClick={() => handleQuantityChange(item.id, item.cantidad + 1)}
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="col-total">
                        <span className="total-price">{formatPrice(item.precio * item.cantidad)}</span>
                      </div>

                      <div className="col-actions">
                        <button
                          className="remove-btn"
                          onClick={() => handleRemoveItem(item.id)}
                          title="Eliminar del carrito"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Sidebar - Resumen de la orden */}
            <div className="cart-sidebar">
              <div className="order-summary">
                <h3>Resumen de la Orden</h3>
                
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                <div className="shipping-section">
                  <h4>Envío</h4>
                  <div className="shipping-options">
                    <label className="shipping-option">
                      <input
                        type="radio"
                        name="shipping"
                        value="free-shipping"
                        checked={shippingOption === 'free-shipping'}
                        onChange={(e) => handleShippingChange(e.target.value)}
                      />
                      <div className="option-content">
                        <Gift size={16} />
                        <span>Envío gratis</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="summary-row total">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>

                <Link href="/checkout?fromCart=true" className="checkout-btn">
                  Proceder al Pago
                </Link>

                <Link href="/catalog" className="continue-shopping-link">
                  Continuar Comprando
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default CartPage;
