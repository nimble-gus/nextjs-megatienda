'use client';

import '@/styles/ProductDescription.css';

const ProductDescription = ({ product }) => {
  return (
    <div className="product-description">
      <h2 className="description-title">Detalles Adicionales</h2>
      
      <div className="description-content">
        {/* Información adicional */}
        <div className="additional-info">
          <h3>Información Adicional</h3>
          <ul>
            <li>Producto original con garantía</li>
            <li>Envío seguro y rápido</li>
            <li>Devolución gratuita en 30 días</li>
            <li>Atención al cliente 24/7</li>
          </ul>
        </div>

        {/* Beneficios */}
        <div className="benefits">
          <h3>Beneficios</h3>
          <div className="benefits-grid">
            <div className="benefit-item">
              <span className="benefit-icon">✨</span>
              <div className="benefit-content">
                <h4>Calidad Premium</h4>
                <p>Productos de la más alta calidad garantizada</p>
              </div>
            </div>
            
            <div className="benefit-item">
              <span className="benefit-icon">🚚</span>
              <div className="benefit-content">
                <h4>Envío Rápido</h4>
                <p>Entrega en 24-48 horas en toda Guatemala</p>
              </div>
            </div>
            
            <div className="benefit-item">
              <span className="benefit-icon">🛡️</span>
              <div className="benefit-content">
                <h4>Garantía</h4>
                <p>30 días de garantía de devolución</p>
              </div>
            </div>
            
            <div className="benefit-item">
              <span className="benefit-icon">💬</span>
              <div className="benefit-content">
                <h4>Soporte</h4>
                <p>Atención al cliente disponible 24/7</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDescription;
