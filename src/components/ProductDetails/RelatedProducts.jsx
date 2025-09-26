'use client';

import Link from 'next/link';
import Image from 'next/image';
import '@/styles/RelatedProducts.css';

const RelatedProducts = ({ products, formatPrice }) => {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="related-products">
      <h2 className="related-title">Productos Relacionados</h2>
      
      <div className="related-grid">
        {products.map((product) => (
          <Link 
            key={product.id} 
            href={`/product/${product.id}`}
            className="related-product-card"
          >
            <div className="related-product-image">
              {product.thumbnailImage || product.mainImage ? (
                <Image 
                  src={product.thumbnailImage || product.mainImage} 
                  alt={product.name}
                  width={300}
                  height={300}
                  className="related-image"
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <div className="image-placeholder">
                  <span>Sin imagen</span>
                </div>
              )}
            </div>
            
            <div className="related-product-info">
              <h3 className="related-product-name">{product.name}</h3>
              <div className="related-product-price">
                {product.minPrice && product.maxPrice && product.minPrice === product.maxPrice 
                  ? formatPrice(product.minPrice)
                  : product.minPrice && product.maxPrice
                  ? `${formatPrice(product.minPrice)} - ${formatPrice(product.maxPrice)}`
                  : product.minPrice 
                  ? formatPrice(product.minPrice)
                  : 'Sin precio'
                }
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
