'use client';

import { useState } from 'react';
import '@/styles/HamsterLoader.css';

const SimpleHamsterTest = () => {
  const [showLoader, setShowLoader] = useState(true);

  return (
    <div style={{ 
      padding: '50px', 
      textAlign: 'center', 
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <h1>🧪 Test Simple del HamsterLoader</h1>
      
      <button 
        onClick={() => setShowLoader(!showLoader)}
        style={{
          padding: '15px 30px',
          margin: '20px',
          fontSize: '16px',
          backgroundColor: showLoader ? '#ff6b6b' : '#4ecdc4',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        {showLoader ? 'Ocultar' : 'Mostrar'} HamsterLoader
      </button>

      {showLoader && (
        <div style={{ marginTop: '30px' }}>
          <h3>HamsterLoader Básico:</h3>
          <div className="hamster-loader-container">
            <div className="wheel-and-hamster">
              <div className="wheel"></div>
              <div className="hamster">
                <div className="hamster__body">
                  <div className="hamster__head">
                    <div className="hamster__ear"></div>
                    <div className="hamster__eye"></div>
                    <div className="hamster__nose"></div>
                  </div>
                  <div className="hamster__limb hamster__limb--fr"></div>
                  <div className="hamster__limb hamster__limb--fl"></div>
                  <div className="hamster__limb hamster__limb--br"></div>
                  <div className="hamster__limb hamster__limb--bl"></div>
                  <div className="hamster__tail"></div>
                </div>
              </div>
              <div className="spoke"></div>
            </div>
            <div className="hamster-loader-message">
              ¡El hamster está corriendo! 🐹
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: '50px', fontSize: '14px', color: '#666' }}>
        <p>Si no ves el hamster corriendo, hay un problema con el CSS.</p>
        <p>Verifica que el archivo HamsterLoader.css se esté cargando correctamente.</p>
      </div>
    </div>
  );
};

export default SimpleHamsterTest;
