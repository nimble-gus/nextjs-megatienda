'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import ProductGallery from './ProductGallery';
import ProductInfo from './ProductInfo';
import ProductDescription from './ProductDescription';
import RelatedProducts from './RelatedProducts';
import { addToCart } from '@/services/cartService';
import '@/styles/ProductDetails.css';

const ProductDetails = ({ product }) => {
  const router = useRouter();
  
  // Seleccionar el primer color disponible por defecto
  const defaultColor = product.colors?.find(color => color.available) || product.colors?.[0] || null;
  const [selectedColor, setSelectedColor] = useState(defaultColor);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Detectar estado de autenticación al montar el componente y escuchar cambios
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const user = localStorage.getItem('user');
        const token = localStorage.getItem('token');

                 if (user) {
           const userData = JSON.parse(user);

           if (userData && (userData.id || userData.usuario_id)) {

             setIsLoggedIn(true);
           } else {

             setIsLoggedIn(false);
           }
         } else {

           setIsLoggedIn(false);
         }
      } catch (error) {
        console.error('❌ Error verificando autenticación:', error);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    // Verificar estado inicial
    checkAuthStatus();

         // Escuchar cambios en localStorage para detectar login/logout
     const handleStorageChange = (e) => {
       if (e.key === 'user') {

         checkAuthStatus();
       }
     };

    // Escuchar eventos personalizados de login/logout
    const handleLoginSuccess = () => {

      // Pequeño delay para asegurar que localStorage se haya actualizado
      setTimeout(checkAuthStatus, 100);
    };

    const handleLogout = () => {

      setIsLoggedIn(false);
      setIsLoading(false);
    };

    // Agregar event listeners
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('loginSuccess', handleLoginSuccess);
    window.addEventListener('logout', handleLogout);

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('loginSuccess', handleLoginSuccess);
      window.removeEventListener('logout', handleLogout);
    };
  }, []);

  // Función para formatear precio en Quetzales
  const formatPrice = (price) => {
    if (price === null || price === undefined || isNaN(price) || price === 0) {
      return 'Sin precio';
    }
    return `Q${price.toFixed(2)}`;
  };

  // Función para renderizar estrellas
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} className={`star ${index < rating ? 'filled' : 'empty'}`}>
        ★
      </span>
    ));
  };

  const handleQuantityChange = (newQuantity) => {
    if (selectedColor && newQuantity >= 1 && newQuantity <= selectedColor.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedColor) {
      alert('Por favor selecciona un color');
      return;
    }

    // Verificar si el usuario está logueado
    if (!isLoggedIn) {
      alert('Debes iniciar sesión para agregar productos al carrito');
      return;
    }

    try {
      setIsAddingToCart(true);
      setCartMessage('');

      const user = JSON.parse(localStorage.getItem('user'));
      const productData = {
        usuario_id: user.id || user.usuario_id,
        producto_id: product.id,
        color_id: selectedColor.id,
        cantidad: quantity
      };

      const result = await addToCart(productData);
      
      // Mostrar mensaje de éxito
      setCartMessage(result.message);
      
      // Disparar evento para actualizar contador en el header
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => {
        setCartMessage('');
      }, 3000);

    } catch (error) {
      console.error('Error agregando al carrito:', error);
      setCartMessage(`Error: ${error.message}`);
      
      // Limpiar mensaje de error después de 5 segundos
      setTimeout(() => {
        setCartMessage('');
      }, 5000);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    if (!selectedColor) {
      alert('Por favor selecciona un color');
      return;
    }

    // Si el usuario está logueado, agregar al carrito y redirigir al checkout
    if (isLoggedIn) {
      handleAddToCart().then(() => {
        // Redirigir al checkout después de agregar al carrito
        router.push('/checkout');
      }).catch((error) => {
        console.error('Error en compra directa:', error);
      });
    } else {
      // Si no está logueado, ir directamente al checkout con parámetros del producto
      const params = new URLSearchParams({
        producto: product.id,
        color: selectedColor.id,
        cantidad: quantity
      });
      
      router.push(`/checkout?${params.toString()}`);
    }
  };

  return (
    <div className="product-details-container">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span>Inicio</span>
        <span>›</span>
        <span>{product.category}</span>
        <span>›</span>
        <span>{product.name}</span>
      </div>

      {/* Mensaje del carrito */}
      {cartMessage && (
        <div className={`cart-message ${cartMessage.includes('Error') ? 'error' : 'success'}`}>
          {cartMessage}
        </div>
      )}

      {/* Contenido principal */}
      <div className="product-details-content">
        {/* Columna izquierda - Galería de imágenes */}
        <div className="product-gallery-section">
          <ProductGallery 
            images={product.images}
            selectedImage={selectedImage}
            onImageSelect={setSelectedImage}
          />
        </div>

        {/* Columna derecha - Información del producto */}
        <div className="product-info-section">
          {selectedColor ? (
            <ProductInfo 
              product={product}
              selectedColor={selectedColor}
              onColorSelect={setSelectedColor}
              quantity={quantity}
              onQuantityChange={handleQuantityChange}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              formatPrice={formatPrice}
              renderStars={renderStars}
              isAddingToCart={isAddingToCart}
              isLoggedIn={isLoggedIn}
              isLoading={isLoading}
            />
          ) : (
            <div className="no-colors-available">
              <p>No hay colores disponibles para este producto</p>
            </div>
          )}
        </div>
      </div>

      {/* Descripción del producto */}
      <div className="product-description-section">
        <ProductDescription product={product} />
      </div>

      {/* Productos relacionados */}
      <div className="related-products-section">
        <RelatedProducts products={product.relatedProducts} formatPrice={formatPrice} />
      </div>
    </div>
  );
};

export default ProductDetails;
