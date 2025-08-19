'use client';

import { useState } from 'react';
import '@/styles/TransferViewer.css';

const TransferViewer = ({ comprobanteUrl, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleImageLoad = () => {
    setLoading(false);
  };

  const handleImageError = () => {
    setLoading(false);
    setError(true);
  };

  const getFileType = (url) => {
    if (!url) return 'unknown';
    const extension = url.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      return 'image';
    } else if (['pdf'].includes(extension)) {
      return 'pdf';
    }
    return 'unknown';
  };

  const fileType = getFileType(comprobanteUrl);

  return (
    <div className="transfer-viewer-overlay" onClick={onClose}>
      <div className="transfer-viewer-content" onClick={(e) => e.stopPropagation()}>
        <div className="transfer-viewer-header">
          <h3>Comprobante de Transferencia</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        
        <div className="transfer-viewer-body">
          {loading && (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Cargando comprobante...</p>
            </div>
          )}
          
          {error && (
            <div className="error-container">
              <p>❌ Error al cargar el comprobante</p>
              <p className="error-details">
                No se pudo cargar el archivo: {comprobanteUrl}
              </p>
            </div>
          )}
          
          {!error && fileType === 'image' && (
            <div className="image-container">
              <img
                src={comprobanteUrl}
                alt="Comprobante de transferencia"
                onLoad={handleImageLoad}
                onError={handleImageError}
                className="transfer-image"
                style={{ display: loading ? 'none' : 'block' }}
              />
            </div>
          )}
          
          {!error && fileType === 'pdf' && (
            <div className="pdf-container">
              <iframe
                src={comprobanteUrl}
                title="Comprobante de transferencia"
                className="transfer-pdf"
                onLoad={handleImageLoad}
                onError={handleImageError}
                style={{ display: loading ? 'none' : 'block' }}
                sandbox="allow-same-origin allow-scripts allow-forms"
              />
              <div className="pdf-fallback">
                <p>Si el PDF no se muestra correctamente, puedes:</p>
                <a 
                  href={comprobanteUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="download-link"
                >
                  📄 Abrir PDF en nueva pestaña
                </a>
              </div>
            </div>
          )}
          
          {!error && fileType === 'unknown' && (
            <div className="unknown-file-container">
              <p>📎 Archivo no reconocido</p>
              <a 
                href={comprobanteUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="download-link"
              >
                Descargar archivo
              </a>
            </div>
          )}
        </div>
        
        <div className="transfer-viewer-footer">
          <button onClick={onClose} className="close-button">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransferViewer;
