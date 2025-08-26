'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Topbar from '@/components/layout/Topbar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductDetails from '@/components/ProductDetails/ProductDetails';
import '@/styles/ProductDetailsPage.css';

export default function ProductDetailsPage() {
  const params = useParams();
  const productId = params.id;
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        
        // Obtener datos del producto desde la API
        const response = await fetch(`/api/products/${productId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Producto no encontrado');
          } else {
            setError('Error al cargar los detalles del producto');
          }
          setLoading(false);
          return;
        }
        
        const productData = await response.json();
        
        // Obtener productos relacionados
        try {
          const relatedResponse = await fetch(
            `/api/products/related?categoryId=${productData.categoryId}&excludeId=${productId}&limit=4`
          );
          
          if (relatedResponse.ok) {
            const relatedProducts = await relatedResponse.json();
            productData.relatedProducts = relatedProducts;
          }
        } catch (relatedError) {
          console.error('Error cargando productos relacionados:', relatedError);
          productData.relatedProducts = [];
        }
        
        setProduct(productData);
        setLoading(false);
        
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Error al cargar los detalles del producto');
        setLoading(false);
      }
    };

    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="product-details-page">
        <div className="sticky-wrapper">
          <Topbar />
          <Header />
        </div>
        <main className="product-details-main">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando detalles del producto...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-details-page">
        <div className="sticky-wrapper">
          <Topbar />
          <Header />
        </div>
        <main className="product-details-main">
          <div className="error-container">
            <h2>Error</h2>
            <p>{error}</p>
            <button onClick={() => window.history.back()}>Volver</button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-details-page">
        <div className="sticky-wrapper">
          <Topbar />
          <Header />
        </div>
        <main className="product-details-main">
          <div className="error-container">
            <h2>Producto no encontrado</h2>
            <p>El producto que buscas no existe o ha sido removido.</p>
            <button onClick={() => window.history.back()}>Volver</button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="product-details-page">
      {/* Header */}
      <div className="sticky-wrapper">
        <Topbar />
        <Header />
      </div>

      {/* Contenido principal */}
      <main className="product-details-main">
        <ProductDetails product={product} />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
