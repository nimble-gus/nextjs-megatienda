'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, ZoomIn } from 'lucide-react';
import '@/styles/ProductGallery.css';

const ProductGallery = ({ images, selectedImage, onImageSelect, onZoomImage }) => {
  return (
    <div className="product-gallery-modern">
      {/* Imagen principal moderna */}
      <div className="gallery-main-modern">
        <div 
          className="main-image-modern"
          onClick={() => onZoomImage && onZoomImage(selectedImage)}
        >
          {images && images.length > 0 ? (
            <>
              <Image 
                src={images[selectedImage]} 
                alt="Producto principal"
                width={600}
                height={600}
                className="main-image-content"
                priority
              />
              <div className="zoom-overlay-modern">
                <ZoomIn size={24} />
                <span>Haz clic para ampliar</span>
              </div>
            </>
          ) : (
            <div className="image-placeholder-modern">
              <div className="placeholder-icon">📷</div>
              <span>Sin imagen disponible</span>
            </div>
          )}
        </div>
      </div>

      {/* Thumbnails modernos */}
      {images && images.length > 1 && (
        <div className="gallery-thumbnails-modern">
          {images.map((image, index) => (
            <button
              key={index}
              className={`thumbnail-modern ${index === selectedImage ? 'active' : ''}`}
              onClick={() => onImageSelect(index)}
            >
              <Image 
                src={image} 
                alt={`Vista ${index + 1}`}
                width={80}
                height={80}
                className="thumbnail-image-modern"
              />
            </button>
          ))}
        </div>
      )}

      {/* Indicadores minimalistas */}
      {images && images.length > 1 && (
        <div className="gallery-indicators-modern">
          {images.map((_, index) => (
            <button
              key={index}
              className={`indicator-modern ${index === selectedImage ? 'active' : ''}`}
              onClick={() => onImageSelect(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
