'use client';

import { useState } from 'react';
import HamsterLoader from './HamsterLoader';

const HamsterLoaderTest = () => {
  const [showLoader, setShowLoader] = useState(false);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>🧪 Test del HamsterLoader</h2>
      
      <button 
        onClick={() => setShowLoader(!showLoader)}
        style={{
          padding: '10px 20px',
          margin: '10px',
          backgroundColor: showLoader ? '#ff6b6b' : '#4ecdc4',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        {showLoader ? 'Ocultar' : 'Mostrar'} HamsterLoader
      </button>

      {showLoader && (
        <div style={{ marginTop: '20px' }}>
          <h3>HamsterLoader Pequeño:</h3>
          <HamsterLoader size="small" message="Cargando..." />
          
          <h3>HamsterLoader Mediano:</h3>
          <HamsterLoader size="medium" message="Procesando datos..." />
          
          <h3>HamsterLoader Grande:</h3>
          <HamsterLoader size="large" message="Inicializando sistema..." />
          
          <h3>HamsterLoader sin mensaje:</h3>
          <HamsterLoader size="medium" showMessage={false} />
        </div>
      )}
    </div>
  );
};

export default HamsterLoaderTest;
