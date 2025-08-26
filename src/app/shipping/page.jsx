'use client';
import { useEffect } from 'react';
import Topbar from '@/components/layout/Topbar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import '@/styles/ShippingPage.css';

const ShippingPage = () => {
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
      <section className="shipping-hero">
        <div className="hero-content">
          <div className="hero-text animate-on-scroll">
            <h1 className="hero-title">
              <span className="title-icon">📦</span>
              <br />
              <span className="title-main">Envíos y Devoluciones</span>
            </h1>
            <div className="hero-subtitle">
              Políticas claras para una experiencia de compra segura y satisfactoria
            </div>
          </div>
          <div className="hero-visual animate-on-scroll">
            <div className="shipping-elements">
              <div className="shipping-icon box">📦</div>
              <div className="shipping-icon truck">🚚</div>
              <div className="shipping-icon return">↩️</div>
              <div className="shipping-icon guarantee">🛡️</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contenido principal */}
      <main className="shipping-main">
        <div className="shipping-content">
          {/* Sección de introducción */}
          <section className="intro-section animate-on-scroll">
            <div className="section-container">
              <div className="intro-card">
                <div className="card-icon">💙</div>
                <h2 className="intro-title">📦 Políticas de Devolución y Garantía</h2>
                <p className="intro-text">
                  En La Mega Tienda GT queremos que tu experiencia de compra sea segura y satisfactoria. 
                  Por eso, contamos con políticas claras de devolución y garantía para brindarte tranquilidad 
                  al comprar con nosotros.
                </p>
              </div>
            </div>
          </section>

          {/* Sección 1: Devoluciones */}
          <section className="policy-section animate-on-scroll">
            <div className="section-container">
              <div className="policy-card">
                <div className="policy-header">
                  <div className="policy-number">1</div>
                  <h2 className="policy-title">📌 Devoluciones</h2>
                </div>
                <ul className="policy-list">
                  <li>Puedes solicitar una devolución dentro de los 5 días posteriores a la entrega de tu pedido.</li>
                  <li>El producto debe estar en perfectas condiciones, sin uso, con su empaque original y todos los accesorios incluidos.</li>
                  <li>Los costos de envío por devolución corren por cuenta del cliente, salvo en casos de error de envío o producto defectuoso.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Sección 2: Productos con defecto de fábrica */}
          <section className="policy-section animate-on-scroll">
            <div className="section-container">
              <div className="policy-card">
                <div className="policy-header">
                  <div className="policy-number">2</div>
                  <h2 className="policy-title">📌 Productos con defecto de fábrica</h2>
                </div>
                <ul className="policy-list">
                  <li>Si recibes un producto con defecto de fábrica, debes reportarlo dentro de las primeras 48 horas después de recibirlo.</li>
                  <li>Procederemos a cambiar el producto por uno nuevo sin costo adicional, o bien, ofrecerte un reembolso si no contamos con stock.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Sección 3: Garantía */}
          <section className="policy-section animate-on-scroll">
            <div className="section-container">
              <div className="policy-card">
                <div className="policy-header">
                  <div className="policy-number">3</div>
                  <h2 className="policy-title">📌 Garantía</h2>
                </div>
                <ul className="policy-list">
                  <li>La mayoría de nuestros productos cuentan con garantía de 30 días por defectos de fábrica.</li>
                  <li>Algunos artículos específicos (como motocicletas, maquinaria o electrónicos) tienen una garantía especial que será informada en la descripción de cada producto.</li>
                  <li>La garantía no cubre daños ocasionados por uso inadecuado, golpes, caídas, humedad, alteraciones o reparaciones no autorizadas.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Sección 4: Productos no sujetos a devolución */}
          <section className="policy-section animate-on-scroll">
            <div className="section-container">
              <div className="policy-card">
                <div className="policy-header">
                  <div className="policy-number">4</div>
                  <h2 className="policy-title">📌 Productos no sujetos a devolución</h2>
                </div>
                <p className="policy-description">
                  Por razones de higiene y seguridad, no aceptamos devoluciones de:
                </p>
                <ul className="policy-list">
                  <li>Ropa interior</li>
                  <li>Productos de uso personal</li>
                  <li>Alimentos o suplementos</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Sección 5: Procedimiento para solicitar devolución */}
          <section className="policy-section animate-on-scroll">
            <div className="section-container">
              <div className="policy-card">
                <div className="policy-header">
                  <div className="policy-number">5</div>
                  <h2 className="policy-title">📌 Procedimiento para solicitar una devolución o garantía</h2>
                </div>
                <ol className="policy-ordered-list">
                  <li>Escríbenos a 📧 <a href="mailto:atencion@thebestprice.gt" className="email-link">atencion@thebestprice.gt</a> indicando tu número de orden y el motivo de la devolución.</li>
                  <li>Adjunta fotografías claras del producto en caso de defecto o daño.</li>
                  <li>Nuestro equipo evaluará el caso y te dará una respuesta en un plazo máximo de 48 horas hábiles.</li>
                </ol>
              </div>
            </div>
          </section>

          {/* Sección 6: Reembolsos */}
          <section className="policy-section animate-on-scroll">
            <div className="section-container">
              <div className="policy-card">
                <div className="policy-header">
                  <div className="policy-number">6</div>
                  <h2 className="policy-title">📌 Reembolsos</h2>
                </div>
                <ul className="policy-list">
                  <li>Los reembolsos se realizarán en un plazo de 5 a 10 días hábiles una vez aprobada la devolución.</li>
                  <li>El reembolso puede hacerse a tu misma forma de pago o mediante un crédito en tienda para futuras compras.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Sección de contacto */}
          <section className="contact-section animate-on-scroll">
            <div className="section-container">
              <div className="contact-card">
                <div className="contact-icon">📞</div>
                <h2>¿Necesitas ayuda con una devolución?</h2>
                <p>Nuestro equipo de atención al cliente está disponible para ayudarte con cualquier consulta sobre envíos, devoluciones o garantías</p>
                <div className="contact-buttons">
                  <a href="/contact" className="contact-btn primary">
                    Contáctanos
                  </a>
                  <a href="mailto:atencion@thebestprice.gt" className="contact-btn secondary">
                    Enviar Email
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

export default ShippingPage;
