'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import ProductGallery from './ProductGallery';
import ProductInfo from './ProductInfo';
import ProductDescription from './ProductDescription';
import RelatedProducts from './RelatedProducts';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/contexts/CartContext';
import HamsterLoader from '@/components/common/HamsterLoader';
import Swal from 'sweetalert2';
import '@/styles/ProductDetails.css';

const ProductDetails = ({ product }) => {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { addToCart } = useCart();
  
  // Seleccionar el primer color disponible por defecto
  const defaultColor = product.colors?.find(color => color.available) || product.colors?.[0] || null;
  const [selectedColor, setSelectedColor] = useState(defaultColor);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Limpiar estado de loading cuando el componente se desmonte
  useEffect(() => {
    return () => {
      setIsAddingToCart(false);
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
      Swal.fire({
        icon: 'warning',
        title: 'Color requerido',
        text: 'Por favor selecciona un color antes de agregar al carrito',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    setIsAddingToCart(true);

    // Timeout de seguridad para evitar loader infinito
    const safetyTimeout = setTimeout(() => {
      setIsAddingToCart(false);
    }, 10000); // 10 segundos máximo

    try {
      // Agregar al carrito
      await addToCart(product, selectedColor, quantity);
      
      // Limpiar timeout de seguridad
      clearTimeout(safetyTimeout);
      
      // Ocultar loader inmediatamente después del éxito
      setIsAddingToCart(false);
      
      // Mostrar alerta de éxito
      await Swal.fire({
        icon: 'success',
        title: '¡Producto agregado!',
        text: `${product.name} (${selectedColor.name}) ha sido agregado al carrito exitosamente`,
        confirmButtonText: 'Continuar comprando',
        confirmButtonColor: '#10b981',
        showCancelButton: true,
        cancelButtonText: 'Ver carrito',
        cancelButtonColor: '#6b7280'
      }).then((result) => {
        if (result.dismiss === Swal.DismissReason.cancel) {
          // Redirigir al carrito (cuando esté implementado)
          // TODO: Implementar redirección al carrito
        }
      });
      
    } catch (error) {
      console.error('Error agregando al carrito:', error);
      
      // Limpiar timeout de seguridad
      clearTimeout(safetyTimeout);
      
      // Ocultar loader inmediatamente después del error
      setIsAddingToCart(false);
      
      // Mostrar alerta de error
      await Swal.fire({
        icon: 'error',
        title: 'Error al agregar',
        text: 'Hubo un problema al agregar el producto al carrito. Por favor intenta nuevamente.',
        confirmButtonText: 'Intentar de nuevo',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  const handleBuyNow = () => {
    if (!selectedColor) {
      alert('Por favor selecciona un color');
      return;
    }

    // Ir directamente al checkout con parámetros del producto
    const params = new URLSearchParams({
      producto: product.id,
      color: selectedColor.id,
      cantidad: quantity
    });
    
    router.push(`/checkout?${params.toString()}`);
  };

  return (
    <div className="product-details-modern">
      {/* Hero Section */}
      <div className="product-hero">
        <div className="product-hero-content">
          {/* Breadcrumb minimalista */}
          <nav className="breadcrumb-minimal">
            <a href="/" className="breadcrumb-link">Inicio</a>
            <span className="breadcrumb-separator">/</span>
            <a href={`/catalog?category=${product.categoryId}`} className="breadcrumb-link">{product.category}</a>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">{product.name}</span>
          </nav>

          {/* Layout principal */}
          <div className="product-layout">
            {/* Galería de imágenes */}
            <div className="product-gallery-modern">
              <ProductGallery 
                images={product.images}
                selectedImage={selectedImage}
                onImageSelect={setSelectedImage}
              />
            </div>

            {/* Información del producto */}
            <div className="product-info-modern">
              {selectedColor ? (
                <ProductInfo 
                  product={product}
                  selectedColor={selectedColor}
                  onColorSelect={setSelectedColor}
                  quantity={quantity}
                  onQuantityChange={handleQuantityChange}
                  onBuyNow={handleBuyNow}
                  onAddToCart={handleAddToCart}
                  isAuthenticated={isAuthenticated}
                  isAddingToCart={isAddingToCart}
                  formatPrice={formatPrice}
                  renderStars={renderStars}
                />
              ) : (
                <div className="no-colors-available">
                  <p>No hay colores disponibles para este producto</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Descripción expandida */}
      <div className="product-description-modern">
        <ProductDescription product={product} />
      </div>

      {/* Productos relacionados */}
      <div className="related-products-modern">
        <RelatedProducts products={product.relatedProducts} formatPrice={formatPrice} />
      </div>

      {/* Modal de loading */}
      {isAddingToCart && (
        <div className="loading-modal-overlay">
          <div className="loading-modal-content">
            <HamsterLoader 
              size="medium" 
              message="Agregando al carrito..." 
              showMessage={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
