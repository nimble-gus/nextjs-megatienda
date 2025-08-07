'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import '../../styles/HeroSection.css';

const slides = [
  {
    id: 1,
    image: '/assets/hero1.jpg',
    titulo: 'Audífonos de Temporada',
  },
  {
    id: 2,
    image: '/assets/hero2.jpg',
    titulo: 'Smartwatches con Descuento',
  },
];


const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const slide = slides[currentSlide];

  return (
    <div className="hero-container">
      <div className="image-wrapper">
        <Image
          src={slide.image}
          alt={slide.titulo}
          fill
          priority
          className="hero-image"
        />
      </div>
    </div>
  );
};

export default HeroSection;
