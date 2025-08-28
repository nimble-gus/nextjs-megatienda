'use client';
import { useEffect } from 'react';
import Topbar from '@/components/layout/Topbar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import '@/styles/TermsPage.css';

const TermsPage = () => {
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
      <section className="terms-hero">
        <div className="hero-content">
          <div className="hero-text animate-on-scroll">
            <h1 className="hero-title">
              <span className="title-icon">📋</span>
              <br />
              <span className="title-main">Términos y Condiciones</span>
            </h1>
            <div className="hero-subtitle">
              Conoce las reglas y condiciones que rigen el uso de nuestra plataforma
            </div>
          </div>
          <div className="hero-visual animate-on-scroll">
            <div className="legal-elements">
              <div className="legal-icon document">📄</div>
              <div className="legal-icon check">✅</div>
              <div className="legal-icon shield">🛡️</div>
              <div className="legal-icon balance">⚖️</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contenido principal */}
      <main className="terms-main">
        <div className="terms-content">
          {/* Sección de introducción */}
          <section className="intro-section animate-on-scroll">
            <div className="section-container">
              <div className="intro-card">
                <div className="card-icon">📝</div>
                <p className="intro-text">
                  Al utilizar La Mega Tienda GT, aceptas estos términos y condiciones que establecen 
                  las reglas para el uso de nuestra plataforma de comercio electrónico. 
                  Te recomendamos leerlos cuidadosamente antes de realizar cualquier compra.
                </p>
              </div>
            </div>
          </section>

          {/* Sección 1: Aceptación de términos */}
          <section className="terms-section animate-on-scroll">
            <div className="section-container">
              <div className="terms-card">
                <div className="terms-header">
                  <div className="terms-number">1</div>
                  <h2 className="terms-title">📌 Aceptación de Términos</h2>
                </div>
                <p className="terms-description">
                  Al acceder y utilizar nuestro sitio web, aceptas estar sujeto a estos términos y condiciones. 
                  Si no estás de acuerdo con alguna parte de estos términos, no debes utilizar nuestros servicios.
                </p>
                <ul className="terms-list">
                  <li>Debes tener al menos 18 años para realizar compras</li>
                  <li>Eres responsable de mantener la confidencialidad de tu cuenta</li>
                  <li>Debes proporcionar información precisa y actualizada</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Sección 2: Uso del sitio */}
          <section className="terms-section animate-on-scroll">
            <div className="section-container">
              <div className="terms-card">
                <div className="terms-header">
                  <div className="terms-number">2</div>
                  <h2 className="terms-title">📌 Uso del Sitio Web</h2>
                </div>
                <p className="terms-description">
                  Nuestro sitio web está destinado únicamente para uso personal y comercial legítimo. 
                  Está prohibido:
                </p>
                <ul className="terms-list">
                  <li>Usar el sitio para actividades ilegales o fraudulentas</li>
                  <li>Intentar acceder a áreas restringidas del sistema</li>
                  <li>Interferir con el funcionamiento del sitio</li>
                  <li>Transmitir virus o código malicioso</li>
                  <li>Realizar compras con información falsa</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Sección 3: Productos y precios */}
          <section className="terms-section animate-on-scroll">
            <div className="section-container">
              <div className="terms-card">
                <div className="terms-header">
                  <div className="terms-number">3</div>
                  <h2 className="terms-title">📌 Productos y Precios</h2>
                </div>
                <p className="terms-description">
                  Nos esforzamos por mantener información precisa sobre nuestros productos, 
                  pero nos reservamos el derecho de:
                </p>
                <ul className="terms-list">
                  <li>Modificar precios sin previo aviso</li>
                  <li>Limitar cantidades de compra</li>
                  <li>Descontinuar productos en cualquier momento</li>
                  <li>Corregir errores en precios o descripciones</li>
                  <li>Rechazar pedidos si consideramos necesario</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Sección 4: Proceso de compra */}
          <section className="terms-section animate-on-scroll">
            <div className="section-container">
              <div className="terms-card">
                <div className="terms-header">
                  <div className="terms-number">4</div>
                  <h2 className="terms-title">📌 Proceso de Compra</h2>
                </div>
                <p className="terms-description">
                  Al realizar una compra en nuestro sitio:
                </p>
                <ul className="terms-list">
                  <li>Debes completar el proceso de checkout</li>
                  <li>El pedido se confirma al recibir el pago</li>
                  <li>Recibirás confirmación por email</li>
                  <li>Nos reservamos el derecho de cancelar pedidos</li>
                  <li>Los precios incluyen impuestos aplicables</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Sección 5: Pagos y facturación */}
          <section className="terms-section animate-on-scroll">
            <div className="section-container">
              <div className="terms-card">
                <div className="terms-header">
                  <div className="terms-number">5</div>
                  <h2 className="terms-title">📌 Pagos y Facturación</h2>
                </div>
                <p className="terms-description">
                  Aceptamos los métodos de pago especificados en nuestro sitio. 
                  Al realizar un pago:
                </p>
                <ul className="terms-list">
                  <li>Autorizas el cargo a tu método de pago</li>
                  <li>Confirmas que tienes derecho a usar el método de pago</li>
                  <li>Nos proporcionas información de facturación precisa</li>
                  <li>Entiendes que los precios están en Quetzales (GTQ)</li>
                  <li>Reconoces que el pago se procesa de forma segura</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Sección 6: Envíos y entregas */}
          <section className="terms-section animate-on-scroll">
            <div className="section-container">
              <div className="terms-card">
                <div className="terms-header">
                  <div className="terms-number">6</div>
                  <h2 className="terms-title">📌 Envíos y Entregas</h2>
                </div>
                <p className="terms-description">
                  Realizamos envíos a todo el territorio nacional:
                </p>
                <ul className="terms-list">
                  <li>Los tiempos de entrega son estimados</li>
                  <li>Los costos de envío se calculan al momento del checkout</li>
                  <li>Entregamos en días hábiles</li>
                  <li>Requerimos firma de recibido en algunos casos</li>
                  <li>No nos hacemos responsables por retrasos de terceros</li>
                </ul>
              </div>
            </div>
          </section>


          {/* Sección 8: Limitación de responsabilidad */}
          <section className="terms-section animate-on-scroll">
            <div className="section-container">
              <div className="terms-card">
                <div className="terms-header">
                  <div className="terms-number">7</div>
                  <h2 className="terms-title">📌 Limitación de Responsabilidad</h2>
                </div>
                <p className="terms-description">
                  La Mega Tienda GT no será responsable por:
                </p>
                <ul className="terms-list">
                  <li>Daños indirectos o consecuenciales</li>
                  <li>Pérdida de datos o información</li>
                  <li>Interrupciones del servicio</li>
                  <li>Acciones de terceros</li>
                  <li>Uso indebido de nuestros productos</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Sección 9: Propiedad intelectual */}
          <section className="terms-section animate-on-scroll">
            <div className="section-container">
              <div className="terms-card">
                <div className="terms-header">
                  <div className="terms-number">8</div>
                  <h2 className="terms-title">📌 Propiedad Intelectual</h2>
                </div>
                <p className="terms-description">
                  Todo el contenido de nuestro sitio web está protegido por derechos de autor:
                </p>
                <ul className="terms-list">
                  <li>Logotipos, marcas y diseños son propiedad nuestra</li>
                  <li>No está permitida la reproducción sin autorización</li>
                  <li>Las imágenes de productos son propiedad de sus respectivos dueños</li>
                  <li>El contenido no puede ser usado comercialmente</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Sección 10: Modificaciones */}
          <section className="terms-section animate-on-scroll">
            <div className="section-container">
              <div className="terms-card">
                <div className="terms-header">
                  <div className="terms-number">9</div>
                  <h2 className="terms-title">📌 Modificaciones</h2>
                </div>
                <p className="terms-description">
                  Nos reservamos el derecho de modificar estos términos en cualquier momento. 
                  Los cambios entrarán en vigor inmediatamente después de su publicación en el sitio web. 
                  Es tu responsabilidad revisar periódicamente estos términos.
                </p>
              </div>
            </div>
          </section>

          {/* Sección de contacto */}
          <section className="contact-section animate-on-scroll">
            <div className="section-container">
              <div className="contact-card">
                <div className="contact-icon">📞</div>
                <h2>¿Tienes dudas sobre nuestros términos?</h2>
                <p>Nuestro equipo legal está disponible para aclarar cualquier punto de estos términos y condiciones</p>
                <div className="contact-buttons">
                  <a href="/contact" className="contact-btn primary">
                    Contáctanos
                  </a>
                  <a href="/privacy" target="_blank" rel="noopener noreferrer" className="contact-btn secondary">
                    Ver Políticas de Privacidad
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

export default TermsPage;
