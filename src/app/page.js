// src/app/page.js
'use client';

import { useEffect } from 'react';
import Topbar from '@/components/layout/Topbar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/Home/HeroSection';
import CategoriesSection from '@/components/Home/CategoriesSection';
import FeaturedProducts from '@/components/Home/FeaturedProducts';
import PromoBanners from '@/components/Home/PromoBanners';

import '@/styles/HomePage.css';


export default function Home() {
  // Debug: Efecto para monitorear el sticky behavior
  useEffect(() => {
    const stickyWrapper = document.querySelector('.sticky-wrapper');
    
    if (stickyWrapper) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          // Añadir clase cuando el elemento esté "stuck"
          if (entry.intersectionRatio < 1) {
            stickyWrapper.classList.add('stuck');
          } else {
            stickyWrapper.classList.remove('stuck');
          }
        },
        {
          threshold: [1],
          rootMargin: '-1px 0px 0px 0px'
        }
      );
      
      observer.observe(stickyWrapper);
      
      return () => observer.disconnect();
    }
  }, []);

  

  return (
    <div className="page-layout">
      {/* Sticky Wrapper para Topbar + Header */}
      <div className="sticky-wrapper">
        <section className="topbar-section">
          <Topbar />
        </section>

        <section className="header-section">
          <Header />
        </section>
      </div>

      {/* Debug: Elemento de prueba sticky simple (remover después) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="debug-sticky" style={{display: 'none'}}>
          🐛 TEST STICKY - Si ves esto fijo al hacer scroll, sticky funciona
        </div>
      )}

      {/* Hero Section */}
      <section className="hero-section-wrapper">
        <HeroSection />
      </section>

      <section className="promo-section">
          <PromoBanners />
        </section>

      {/* Contenido adicional */}
      <main className="main-content">
        <section className="categories-section">
          <CategoriesSection />
        </section>

        <section className="featured-products-section">
          <FeaturedProducts />
        </section>


      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}