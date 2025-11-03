'use client';

import { useEffect, useState } from 'react';
import '@/styles/MaintenancePage.css';

export default function MaintenancePage() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-GT', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-GT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="maintenance-container">
      <div className="maintenance-content">
        <div className="maintenance-icon">
          <svg 
            width="120" 
            height="120" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" 
              fill="currentColor"
            />
          </svg>
        </div>

        <h1 className="maintenance-title">
          Volvemos En Breve
        </h1>

        <div className="maintenance-time">
          <div className="time-display">
            <span className="time-label">Hora Actual:</span>
            <span className="time-value">{formatTime(currentTime)}</span>
          </div>
          <div className="date-display">
            {formatDate(currentTime)}
          </div>
        </div>

        <div className="maintenance-divider"></div>

        <div className="maintenance-info">
          <p>
            Si tienes alguna consulta urgente, puedes contactarnos a través de nuestros canales de atención.
          </p>
        </div>

        <div className="maintenance-footer">
          <p className="footer-text">
            Gracias por tu comprensión
          </p>
        </div>
      </div>

      {/* Animación de fondo decorativa */}
      <div className="maintenance-background">
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
        <div className="bg-circle bg-circle-3"></div>
      </div>
    </div>
  );
}

