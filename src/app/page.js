// src/app/page.js
'use client';

import Topbar from '@/components/layout/Topbar';
import Header from '@/components/layout/Header';
import HeroSection from '@/components/Home/HeroSection';
import '@/styles/HomePage.css';

export default function Home() {
  return (
    <div className="page-layout">
      {/* Topbar - Franja superior */}
      <section className="topbar-section">
        <Topbar />
      </section>
      
      {/* Header - Franja de navegación */}
      <section className="header-section">
        <Header />
      </section>
      
      {/* Hero Section - Sección principal pero limitada */}
      <section className="hero-section-wrapper">
        <HeroSection />
      </section>
      
      {/* Contenido adicional */}
      <main className="main-content">
        <section className="content-section">
          <div className="container">
          </div>
        </section>
      </main>
    </div>
  );
}