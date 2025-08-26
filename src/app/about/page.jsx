'use client';
import { useEffect } from 'react';
import Topbar from '@/components/layout/Topbar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import '@/styles/AboutPage.css';

const AboutPage = () => {
  useEffect(() => {
    // Animación de entrada suave
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      observer.observe(el);
    });

    return () => observer.disconnect();
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

      {/* Hero Section */}
      <section className="about-hero">
        <div className="hero-content">
          <div className="hero-text animate-on-scroll">
            <h1 className="hero-title">
              <span className="title-highlight">Acerca de</span>
              <br />
              <span className="title-main">La Mega Tienda GT</span>
            </h1>
            <div className="hero-subtitle">
              Tu tienda online de confianza en Guatemala
            </div>
          </div>
          <div className="hero-visual animate-on-scroll">
            <div className="floating-cards">
              <div className="card card-1">🏠</div>
              <div className="card card-2">👶</div>
              <div className="card card-3">🐕</div>
              <div className="card card-4">⚽</div>
              <div className="card card-5">🏍️</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contenido principal */}
      <main className="about-main">
        <div className="about-content">
          {/* Sección de bienvenida */}
          <section className="welcome-section animate-on-scroll">
            <div className="section-container">
              <div className="welcome-card">
                <div className="card-icon">🌟</div>
                <h2 className="section-title">¡Bienvenido a La Mega Tienda GT!</h2>
                <p className="section-text">
                  Somos tu tienda online de confianza donde encontrarás de todo un poco: 
                  productos para tu hogar, artículos para bebés y niños, accesorios para mascotas, 
                  opciones de deporte, salud, y hasta motocicletas.
                </p>
              </div>
            </div>
          </section>

          {/* Sección de misión */}
          <section className="mission-section animate-on-scroll">
            <div className="section-container">
              <div className="mission-grid">
                <div className="mission-card">
                  <div className="card-icon">🎯</div>
                  <h3>Nuestro Objetivo</h3>
                  <p>
                    Que disfrutes una experiencia de compra fácil, rápida y segura, 
                    con precios que realmente se ajustan a tu bolsillo.
                  </p>
                </div>
                <div className="mission-card">
                  <div className="card-icon">🚚</div>
                  <h3>Entrega Nacional</h3>
                  <p>
                    Entregamos en todo el país y siempre estamos listos para 
                    atenderte de manera cercana y personalizada.
                  </p>
                </div>
                <div className="mission-card">
                  <div className="card-icon">💝</div>
                  <h3>Nuestra Promesa</h3>
                  <p>
                    Queremos que te sientas tranquilo al comprar y feliz al recibir. 
                    Porque aquí, siempre tendrás más calidad por menos precio.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Sección de valores */}
          <section className="values-section animate-on-scroll">
            <div className="section-container">
              <h2 className="section-title">Nuestros Valores</h2>
              <div className="values-grid">
                <div className="value-item">
                  <div className="value-icon">🤝</div>
                  <h4>Confianza</h4>
                  <p>Construimos relaciones duraderas basadas en la transparencia</p>
                </div>
                <div className="value-item">
                  <div className="value-icon">⚡</div>
                  <h4>Eficiencia</h4>
                  <p>Procesos optimizados para una experiencia rápida y fluida</p>
                </div>
                <div className="value-item">
                  <div className="value-icon">💎</div>
                  <h4>Calidad</h4>
                  <p>Productos seleccionados con los más altos estándares</p>
                </div>
                <div className="value-item">
                  <div className="value-icon">💰</div>
                  <h4>Precios Justos</h4>
                  <p>Ofertas que realmente benefician tu economía</p>
                </div>
              </div>
            </div>
          </section>

          {/* Sección CTA */}
          <section className="cta-section animate-on-scroll">
            <div className="section-container">
              <div className="cta-card">
                <h2>¿Listo para empezar?</h2>
                <p>Explora nuestro catálogo y descubre todo lo que tenemos para ti</p>
                <div className="cta-buttons">
                  <a href="/catalog" className="cta-btn primary">
                    Ver Catálogo
                  </a>
                  <a href="/contact" className="cta-btn secondary">
                    Contáctanos
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AboutPage;
