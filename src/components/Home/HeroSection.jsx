'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import '../../styles/HeroSection.css';

const HeroSection = () => {
  const [heroImages, setHeroImages] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHeroImages();
  }, []);

  const fetchHeroImages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/multimedia/hero');
      const data = await response.json();
      
      if (data.success && data.data.length > 0) {
        setHeroImages(data.data);
      } else {
        // Fallback a imágenes por defecto si no hay datos
        setHeroImages([
          {
            id: 1,
            url_imagen: '/assets/hero1.jpg',
            titulo: 'Audífonos de Temporada',
          },
          {
            id: 2,
            url_imagen: '/assets/hero2.jpg',
            titulo: 'Smartwatches con Descuento',
          },
        ]);
      }
    } catch (error) {
      console.error('Error fetching hero images:', error);
      // Fallback a imágenes por defecto en caso de error
      setHeroImages([
        {
          id: 1,
          url_imagen: '/assets/hero1.jpg',
          titulo: 'Audífonos de Temporada',
        },
        {
          id: 2,
          url_imagen: '/assets/hero2.jpg',
          titulo: 'Smartwatches con Descuento',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (heroImages.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroImages.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [heroImages.length]);

  if (loading) {
    return (
      <div className="hero-container">
        <div className="image-wrapper">
          <div className="hero-loading">
            <div className="loading-spinner"></div>
            <p>Cargando imágenes...</p>
          </div>
        </div>
      </div>
    );
  }

  if (heroImages.length === 0) {
    return null;
  }

  const slide = heroImages[currentSlide];

  return (
    <div className="hero-container">
      <div className="image-wrapper">
        <Image
          src={slide.url_imagen}
          alt={slide.titulo}
          fill
          priority
          className="hero-image"
        />
      </div>
      
      {heroImages.length > 1 && (
        <div className="hero-dots">
          {heroImages.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroSection;
