'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import '../../styles/PromoBanners.css';

const PromoBanners = () => {
  const [promoBanners, setPromoBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPromoBanners();
  }, []);

  const fetchPromoBanners = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/multimedia/promo');
      const data = await response.json();
      
      if (data.success && data.data.length > 0) {
        setPromoBanners(data.data);
      } else {
        // Fallback a imágenes por defecto si no hay datos
        setPromoBanners([
          {
            id: 1,
            url_imagen: '/assets/promos/promo1-small.webp',
            titulo: 'Promo pequeña',
            enlace: null,
          },
          {
            id: 2,
            url_imagen: '/assets/promos/promo2-medium.jpg',
            titulo: 'Promo mediana',
            enlace: null,
          },
          {
            id: 3,
            url_imagen: '/assets/promos/promo3-large.png',
            titulo: 'Promo grande',
            enlace: null,
          },
        ]);
      }
    } catch (error) {
      console.error('Error fetching promo banners:', error);
      // Fallback a imágenes por defecto en caso de error
      setPromoBanners([
        {
          id: 1,
          url_imagen: '/assets/promos/promo1-small.webp',
          titulo: 'Promo pequeña',
          enlace: null,
        },
        {
          id: 2,
          url_imagen: '/assets/promos/promo2-medium.jpg',
          titulo: 'Promo mediana',
          enlace: null,
        },
        {
          id: 3,
          url_imagen: '/assets/promos/promo3-large.png',
          titulo: 'Promo grande',
          enlace: null,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="promo-banners">
        <div className="promo-loading">
          <div className="loading-spinner"></div>
          <p>Cargando banners promocionales...</p>
        </div>
      </section>
    );
  }

  if (promoBanners.length === 0) {
    return null;
  }

  // Tomar los primeros 3 banners para el layout
  const [smallBanner, mediumBanner, largeBanner] = promoBanners.slice(0, 3);

  const renderBanner = (banner, className) => {
    if (!banner) return null;

    const content = (
      <div className={className}>
        <Image
          src={banner.url_imagen}
          alt={banner.titulo}
          width={400}
          height={300}
          className="promo-image"
        />
        {banner.titulo && <h3 className="promo-title">{banner.titulo}</h3>}
        {banner.descripcion && <p className="promo-description">{banner.descripcion}</p>}
      </div>
    );

    return banner.enlace ? (
      <a href={banner.enlace} key={banner.id} className="promo-link">
        {content}
      </a>
    ) : (
      <div key={banner.id}>{content}</div>
    );
  };

  return (
    <section className="promo-banners">
      <div className="promo-row-top">
        {renderBanner(smallBanner, 'promo-small')}
        {renderBanner(mediumBanner, 'promo-medium')}
      </div>

      {largeBanner && (
        <div className="promo-large">
          {renderBanner(largeBanner, 'promo-large')}
        </div>
      )}
    </section>
  );
};

export default PromoBanners;
