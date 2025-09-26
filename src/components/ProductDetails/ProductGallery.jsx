'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, ZoomIn } from 'lucide-react';
import '@/styles/ProductGallery.css';

const ProductGallery = ({ images, selectedImage, onImageSelect }) => {
  const [showZoomModal, setShowZoomModal] = useState(false);
  return (
    <div className="product-gallery-modern">
      {/* Imagen principal moderna */}
      <div className="gallery-main-modern">
        <div 
          className="main-image-modern"
          onClick={() => setShowZoomModal(true)}
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
