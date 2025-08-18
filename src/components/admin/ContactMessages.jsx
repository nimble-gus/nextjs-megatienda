'use client';
import React, { useState, useEffect } from 'react';
import '@/styles/ContactMessages.css';

const ContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/admin/contact-messages');
      const result = await response.json();
      
      if (result.success) {
        setMessages(result.data);
      } else {
        console.error('Error fetching messages:', result.message);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId) => {
    try {
      const response = await fetch(`/api/admin/contact-messages/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'markAsRead' }),
      });

      const result = await response.json();
      
      if (result.success) {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? { ...msg, leido: true } : msg
        ));
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const deleteMessage = async (messageId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este mensaje?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/contact-messages/${messageId}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (result.success) {
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const openResponseModal = (message) => {
    setSelectedMessage(message);
    setResponseText('');
    setShowResponseModal(true);
  };

  const submitResponse = async () => {
    if (!responseText.trim()) {
      alert('Por favor ingresa una respuesta');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/admin/contact-messages/${selectedMessage.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'respond',
          respuesta: responseText 
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setMessages(prev => prev.map(msg => 
          msg.id === selectedMessage.id ? { 
            ...msg, 
            respondido: true, 
            respuesta: responseText,
            fecha_respuesta: new Date().toISOString()
          } : msg
        ));
        setShowResponseModal(false);
        setSelectedMessage(null);
        setResponseText('');
      }
    } catch (error) {
      console.error('Error submitting response:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-GT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="contact-messages-container">
        <div className="loading">Cargando mensajes...</div>
      </div>
    );
  }

  return (
    <div className="contact-messages-container">
      <div className="messages-header">
        <h2>Mensajes de Contacto</h2>
        <div className="messages-stats">
          <span className="stat">
            Total: {messages.length}
          </span>
          <span className="stat unread">
            No leídos: {messages.filter(m => !m.leido).length}
          </span>
        </div>
      </div>

      <div className="messages-list">
        {messages.length === 0 ? (
          <div className="no-messages">
            No hay mensajes de contacto
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id} 
              className={`message-card ${!message.leido ? 'unread' : ''}`}
            >
              <div className="message-header">
                <div className="message-info">
                  <h3 className="message-subject">{message.asunto}</h3>
                  <div className="message-meta">
                    <span className="sender">{message.nombre}</span>
                    <span className="email">{message.email}</span>
                    <span className="date">{formatDate(message.creado_en)}</span>
                  </div>
                </div>
                <div className="message-actions">
                  {!message.leido && (
                    <button 
                      onClick={() => markAsRead(message.id)}
                      className="action-btn mark-read"
                      title="Marcar como leído"
                    >
                      ✓
                    </button>
                  )}
                  {!message.respondido && (
                    <button 
                      onClick={() => openResponseModal(message)}
                      className="action-btn respond"
                      title="Responder"
                    >
                      💬
                    </button>
                  )}
                  <button 
                    onClick={() => deleteMessage(message.id)}
                    className="action-btn delete"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="message-content">
                <p>{message.mensaje}</p>
              </div>

              {message.respondido && (
                <div className="message-response">
                  <h4>Respuesta:</h4>
                  <p>{message.respuesta}</p>
                  <small>Respondido el: {formatDate(message.fecha_respuesta)}</small>
                </div>
              )}

              <div className="message-status">
                {!message.leido && <span className="status-badge unread">No leído</span>}
                {message.respondido && <span className="status-badge responded">Respondido</span>}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de respuesta */}
      {showResponseModal && (
        <div className="modal-overlay">
          <div className="response-modal">
            <div className="modal-header">
              <h3>Responder a: {selectedMessage?.nombre}</h3>
              <button 
                onClick={() => setShowResponseModal(false)}
                className="close-btn"
              >
                ×
              </button>
            </div>
            
            <div className="modal-content">
              <div className="original-message">
                <h4>Mensaje original:</h4>
                <p>{selectedMessage?.mensaje}</p>
              </div>
              
              <div className="response-form">
                <label htmlFor="response">Tu respuesta:</label>
                <textarea
                  id="response"
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows="6"
                  placeholder="Escribe tu respuesta aquí..."
                />
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                onClick={() => setShowResponseModal(false)}
                className="cancel-btn"
              >
                Cancelar
              </button>
              <button 
                onClick={submitResponse}
                className="submit-btn"
                disabled={submitting}
              >
                {submitting ? 'Enviando...' : 'Enviar Respuesta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactMessages;


