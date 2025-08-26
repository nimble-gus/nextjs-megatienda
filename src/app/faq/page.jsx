'use client';
import { useEffect, useState } from 'react';
import Topbar from '@/components/layout/Topbar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import '@/styles/FAQPage.css';

const FAQPage = () => {
  const [openFAQ, setOpenFAQ] = useState(null);

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

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const faqs = [
    {
      question: "¿Cómo puedo hacer un pedido?",
      answer: "Solo debes elegir el producto que te interesa, agregarlo al carrito y seguir los pasos de compra. También puedes contactarnos por WhatsApp o redes sociales para asistencia directa."
    },
    {
      question: "¿Hacen envíos a todo el país?",
      answer: "✅ Sí, realizamos envíos a toda Guatemala. El costo del envío se calcula según tu ubicación y el tamaño del paquete."
    },
    {
      question: "¿Cuánto tarda en llegar mi pedido?",
      answer: "El tiempo de entrega promedio es de 2 a 5 días hábiles, dependiendo de la ubicación del cliente. En ciudades principales suele ser más rápido."
    },
    {
      question: "¿Qué métodos de pago aceptan?",
      answer: "• Transferencia bancaria\n• Depósito en agencias autorizadas\n• Pago contra entrega (en productos seleccionados y ciertas áreas)\n• Próximamente: pago con tarjeta en línea"
    },
    {
      question: "¿Los productos tienen garantía?",
      answer: "Sí ✅, la mayoría de nuestros productos cuentan con garantía de 30 días por defectos de fábrica. Algunos artículos como motocicletas, maquinaria o electrónicos tienen una garantía especial indicada en su descripción."
    },
    {
      question: "¿Puedo devolver un producto si no estoy satisfecho?",
      answer: "Sí, aceptamos devoluciones dentro de los 7 días posteriores a la entrega, siempre que el producto no haya sido usado y se encuentre en su empaque original."
    },
    {
      question: "¿Cómo puedo dar seguimiento a mi pedido?",
      answer: "Una vez confirmado el envío, te enviaremos un número de guía o contacto para rastrear tu paquete en todo momento."
    },
    {
      question: "¿Puedo comprar al por mayor?",
      answer: "Sí 🙌, ofrecemos precios especiales para compras al por mayor. Escríbenos a 📧 ventas@lamegatienda.gt para más información."
    },
    {
      question: "¿Dónde los puedo contactar?",
      answer: "Puedes comunicarte con nosotros por:\n• 📧 Correo: atencion@lamegatienda.gt\n• 📱 WhatsApp y redes sociales oficiales\n• 🌐 Chat en vivo en nuestra tienda en línea"
    }
  ];

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
      <section className="faq-hero">
        <div className="hero-content">
          <div className="hero-text animate-on-scroll">
            <h1 className="hero-title">
              <span className="title-icon">❓</span>
              <br />
              <span className="title-main">Preguntas Frecuentes</span>
            </h1>
            <div className="hero-subtitle">
              Encuentra respuestas rápidas a las dudas más comunes sobre nuestros productos y servicios
            </div>
          </div>
          <div className="hero-visual animate-on-scroll">
            <div className="faq-elements">
              <div className="faq-icon question">❓</div>
              <div className="faq-icon answer">💡</div>
              <div className="faq-icon help">🤝</div>
              <div className="faq-icon support">📞</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contenido principal */}
      <main className="faq-main">
        <div className="faq-content">
          {/* Sección de introducción */}
          <section className="intro-section animate-on-scroll">
            <div className="section-container">
              <div className="intro-card">
                <div className="card-icon">💙</div>
                <h2 className="intro-title">❓ Preguntas Frecuentes (FAQ)</h2>
                <p className="intro-text">
                  En La Mega Tienda GT queremos que tengas toda la información que necesitas 
                  para hacer tus compras con confianza. Aquí encontrarás las respuestas a las 
                  preguntas más frecuentes de nuestros clientes.
                </p>
              </div>
            </div>
          </section>

          {/* Sección de FAQs */}
          <section className="faq-section animate-on-scroll">
            <div className="section-container">
              <div className="faq-list">
                {faqs.map((faq, index) => (
                  <div key={index} className="faq-item">
                    <button 
                      className={`faq-question ${openFAQ === index ? 'active' : ''}`}
                      onClick={() => toggleFAQ(index)}
                    >
                      <span className="faq-number">{index + 1}</span>
                      <span className="faq-text">{faq.question}</span>
                      <span className="faq-icon-toggle">
                        {openFAQ === index ? '−' : '+'}
                      </span>
                    </button>
                    <div className={`faq-answer ${openFAQ === index ? 'active' : ''}`}>
                      <div className="faq-answer-content">
                        {faq.answer.split('\n').map((line, lineIndex) => (
                          <p key={lineIndex} className="faq-answer-line">
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Sección de contacto */}
          <section className="contact-section animate-on-scroll">
            <div className="section-container">
              <div className="contact-card">
                <div className="contact-icon">📞</div>
                <h2>¿No encontraste la respuesta que buscabas?</h2>
                <p>Nuestro equipo de atención al cliente está disponible para resolver cualquier duda adicional que puedas tener</p>
                <div className="contact-buttons">
                  <a href="/contact" className="contact-btn primary">
                    Contáctanos
                  </a>
                  <a href="mailto:atencion@lamegatienda.gt" className="contact-btn secondary">
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

export default FAQPage;
