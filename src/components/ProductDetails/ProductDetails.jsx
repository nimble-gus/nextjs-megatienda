'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import ProductGallery from './ProductGallery';
import ProductInfo from './ProductInfo';
import ProductDescription from './ProductDescription';
import RelatedProducts from './RelatedProducts';
import '@/styles/ProductDetails.css';

const ProductDetails = ({ product }) => {
  const router = useRouter();
  
  // Seleccionar el primer color disponible por defecto
  const defaultColor = product.colors?.find(color => color.available) || product.colors?.[0] || null;
  const [selectedColor, setSelectedColor] = useState(defaultColor);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

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
    <div className="product-details-container">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span>Inicio</span>
        <span>›</span>
        <span>{product.category}</span>
        <span>›</span>
        <span>{product.name}</span>
      </div>

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
              onBuyNow={handleBuyNow}
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
