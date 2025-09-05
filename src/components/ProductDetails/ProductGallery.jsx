'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, ZoomIn } from 'lucide-react';
import '@/styles/ProductGallery.css';

const ProductGallery = ({ images, selectedImage, onImageSelect }) => {
  const [showZoomModal, setShowZoomModal] = useState(false);
  return (
    <div className="product-gallery">
      {/* Imagen principal */}
      <div 
        className="main-image-container"
        onClick={() => setShowZoomModal(true)}
      >
        {images && images.length > 0 ? (
          <>
            <Image 
              src={images[selectedImage]} 
              alt="Producto principal"
              width={500}
              height={500}
              className="main-image"
              priority
            />
            <div className="zoom-indicator">
              <ZoomIn size={20} />
            </div>
          </>
        ) : (
          <div className="main-image-placeholder">
            <span>Sin imagen disponible</span>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      <div className="thumbnails-container">
        {images && images.length > 0 ? (
          images.map((image, index) => (
            <div 
              key={index}
              className={`thumbnail ${index === selectedImage ? 'active' : ''}`}
              onClick={() => onImageSelect(index)}
            >
              <Image 
                src={image} 
                alt={`Vista ${index + 1}`}
                width={80}
                height={80}
                className="thumbnail-image"
              />
            </div>
          ))
        ) : (
          <div className="thumbnail-placeholder">
            <span>Sin imágenes</span>
          </div>
        )}
      </div>

      {/* Controles de navegación */}
      <div className="gallery-controls">
        <button 
          className="nav-btn prev"
          onClick={() => onImageSelect(Math.max(0, selectedImage - 1))}
          disabled={selectedImage === 0}
        >
          ‹
        </button>
        <button 
          className="nav-btn next"
          onClick={() => onImageSelect(Math.min(images.length - 1, selectedImage + 1))}
          disabled={selectedImage === images.length - 1}
        >
          ›
        </button>
      </div>

      {/* Indicadores */}
      <div className="image-indicators">
        {images.map((_, index) => (
          <button
            key={index}
            className={`indicator ${index === selectedImage ? 'active' : ''}`}
            onClick={() => onImageSelect(index)}
          />
        ))}
      </div>

      {/* Modal de zoom */}
      {showZoomModal && images && images.length > 0 && (
        <div 
          className="image-zoom-modal"
          onClick={() => setShowZoomModal(false)}
        >
          <div className="zoom-modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="zoom-modal-close"
              onClick={() => setShowZoomModal(false)}
            >
              <X size={20} />
            </button>
            <Image 
              src={images[selectedImage]} 
              alt="Producto en vista ampliada"
              width={800}
              height={800}
              className="zoom-modal-image"
              priority
            />
            <div className="zoom-modal-info">
              Imagen {selectedImage + 1} de {images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
