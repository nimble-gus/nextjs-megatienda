'use client';
import React, { useState } from 'react';
import Topbar from '@/components/layout/Topbar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import '@/styles/ContactPage.css';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    asunto: '',
    mensaje: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: 'success', text: 'Mensaje enviado correctamente' });
        setFormData({ nombre: '', email: '', asunto: '', mensaje: '' });
      } else {
        setMessage({ type: 'error', text: result.message || 'Error al enviar el mensaje' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-layout">
      {/* Sticky Wrapper para Topbar + Header - Misma estructura que Home */}
      <div className="sticky-wrapper">
        <section className="topbar-section">
          <Topbar />
        </section>
        <section className="header-section">
          <Header />
        </section>
      </div>

      {/* Contenido principal de contacto */}
      <main className="contact-main">
        <div className="contact-content-wrapper">
          <div className="contact-content">
            {/* Formulario de contacto */}
            <div className="contact-form-section">
              <h2 className="section-title">Contacto</h2>
              <p className="section-subtitle">Estamos aquí para ayudarte. Envíanos un mensaje y te responderemos pronto.</p>
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <label htmlFor="nombre">Tu Nombre</label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                    placeholder="Ingresa tu nombre completo"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Tu Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                    placeholder="tu@email.com"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="asunto">Asunto</label>
                  <input
                    type="text"
                    id="asunto"
                    name="asunto"
                    value={formData.asunto}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                    placeholder="¿En qué podemos ayudarte?"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="mensaje">Tu Mensaje</label>
                  <textarea
                    id="mensaje"
                    name="mensaje"
                    value={formData.mensaje}
                    onChange={handleInputChange}
                    required
                    rows="6"
                    className="form-textarea"
                    placeholder="Escribe tu mensaje aquí..."
                  />
                </div>

                {message.text && (
                  <div className={`message ${message.type}`}>
                    {message.text}
                  </div>
                )}

                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? 'Enviando...' : 'Enviar Mensaje'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Footer - Misma estructura que Home */}
      <Footer />
    </div>
  );
};

export default ContactPage;
