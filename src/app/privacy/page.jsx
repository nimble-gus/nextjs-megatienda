'use client';
import { useEffect } from 'react';
import Topbar from '@/components/layout/Topbar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import '@/styles/PrivacyPage.css';

const PrivacyPage = () => {
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
      <section className="privacy-hero">
        <div className="hero-content">
          <div className="hero-text animate-on-scroll">
            <h1 className="hero-title">
              <span className="title-icon">🔒</span>
              <br />
              <span className="title-main">Políticas de Privacidad</span>
            </h1>
            <div className="hero-subtitle">
              Protegemos tu información con los más altos estándares de seguridad
            </div>
          </div>
          <div className="hero-visual animate-on-scroll">
            <div className="security-elements">
              <div className="security-icon shield">🛡️</div>
              <div className="security-icon lock">🔐</div>
              <div className="security-icon key">🔑</div>
              <div className="security-icon check">✅</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contenido principal */}
      <main className="privacy-main">
        <div className="privacy-content">
          {/* Sección de introducción */}
          <section className="intro-section animate-on-scroll">
            <div className="section-container">
              <div className="intro-card">
                <div className="card-icon">💙</div>
                <p className="intro-text">
                  En La Mega Tienda GT valoramos y protegemos la privacidad de nuestros clientes. 
                  Esta política explica cómo recopilamos, usamos y protegemos tu información personal 
                  al momento de realizar compras en nuestro sitio web.
                </p>
              </div>
            </div>
          </section>

          {/* Sección 1: Información que recopilamos */}
          <section className="policy-section animate-on-scroll">
            <div className="section-container">
              <div className="policy-card">
                <div className="policy-header">
                  <div className="policy-number">1</div>
                  <h2 className="policy-title">📌 Información que recopilamos</h2>
                </div>
                <p className="policy-description">
                  Cuando realizas una compra o te registras en nuestra tienda, podemos solicitar datos como:
                </p>
                <ul className="policy-list">
                  <li>Nombre completo</li>
                  <li>Dirección de entrega</li>
                  <li>Número de teléfono</li>
                  <li>Correo electrónico</li>
                  <li>Datos de pago (procesados de forma segura a través de plataformas certificadas)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Sección 2: Uso de la información */}
          <section className="policy-section animate-on-scroll">
            <div className="section-container">
              <div className="policy-card">
                <div className="policy-header">
                  <div className="policy-number">2</div>
                  <h2 className="policy-title">📌 Uso de la información</h2>
                </div>
                <p className="policy-description">
                  Utilizamos tu información para:
                </p>
                <ul className="policy-list">
                  <li>Procesar y enviar tus pedidos</li>
                  <li>Contactarte en caso de aclaraciones o seguimiento</li>
                  <li>Ofrecerte promociones, descuentos y novedades (solo si aceptas recibirlas)</li>
                  <li>Mejorar tu experiencia en nuestra tienda</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Sección 3: Protección de la información */}
          <section className="policy-section animate-on-scroll">
            <div className="section-container">
              <div className="policy-card">
                <div className="policy-header">
                  <div className="policy-number">3</div>
                  <h2 className="policy-title">📌 Protección de la información</h2>
                </div>
                <p className="policy-description">
                  Tu información personal se maneja de manera confidencial y se almacena en sistemas seguros. 
                  No compartimos, vendemos ni alquilamos tus datos a terceros.
                </p>
              </div>
            </div>
          </section>

          {/* Sección 4: Cookies y navegación */}
          <section className="policy-section animate-on-scroll">
            <div className="section-container">
              <div className="policy-card">
                <div className="policy-header">
                  <div className="policy-number">4</div>
                  <h2 className="policy-title">📌 Cookies y navegación</h2>
                </div>
                <p className="policy-description">
                  Nuestro sitio puede usar cookies para mejorar tu experiencia de compra, como guardar tu carrito 
                  o mostrarte recomendaciones personalizadas. Puedes desactivarlas desde la configuración de tu 
                  navegador, aunque algunas funciones podrían verse limitadas.
                </p>
              </div>
            </div>
          </section>

          {/* Sección 5: Tus derechos */}
          <section className="policy-section animate-on-scroll">
            <div className="section-container">
              <div className="policy-card">
                <div className="policy-header">
                  <div className="policy-number">5</div>
                  <h2 className="policy-title">📌 Tus derechos</h2>
                </div>
                <p className="policy-description">
                  Tienes derecho a:
                </p>
                <ul className="policy-list">
                  <li>Acceder a la información que hemos recopilado sobre ti</li>
                  <li>Solicitar la corrección o eliminación de tus datos</li>
                  <li>Cancelar la suscripción a correos promocionales en cualquier momento</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Sección de contacto */}
          <section className="contact-section animate-on-scroll">
            <div className="section-container">
              <div className="contact-card">
                <div className="contact-icon">📞</div>
                <h2>¿Tienes preguntas sobre privacidad?</h2>
                <p>Nuestro equipo está disponible para resolver cualquier duda sobre el manejo de tu información personal</p>
                <div className="contact-buttons">
                  <a href="/contact" className="contact-btn primary">
                    Contáctanos
                  </a>
                  <a href="/about" className="contact-btn secondary">
                    Conoce más sobre nosotros
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

export default PrivacyPage;
