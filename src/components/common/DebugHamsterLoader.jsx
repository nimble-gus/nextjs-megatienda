'use client';

import { useState, useEffect } from 'react';

const DebugHamsterLoader = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [cssLoaded, setCssLoaded] = useState(false);

  useEffect(() => {
    // Verificar si el CSS se cargó
    const checkCSS = () => {
      const testElement = document.createElement('div');
      testElement.className = 'hamster-loader-container';
      document.body.appendChild(testElement);
      
      const styles = window.getComputedStyle(testElement);
      const hasStyles = styles.display !== 'inline';
      
      document.body.removeChild(testElement);
      setCssLoaded(hasStyles);
    };

    const timer = setTimeout(() => {
      setIsVisible(true);
      checkCSS();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return <div>Inicializando...</div>;

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>🔍 Debug del HamsterLoader</h2>
      
      <div style={{ margin: '20px 0', padding: '10px', backgroundColor: cssLoaded ? '#d4edda' : '#f8d7da', borderRadius: '5px' }}>
        <strong>Estado del CSS:</strong> {cssLoaded ? '✅ Cargado' : '❌ No cargado'}
      </div>

      <div style={{ margin: '20px 0' }}>
        <h3>Test 1: Contenedor básico</h3>
        <div 
          className="hamster-loader-container" 
          style={{ border: '2px solid red', margin: '10px auto', maxWidth: '300px' }}
        >
          <p>Este es el contenedor del HamsterLoader</p>
          <p>Si ves este texto, el CSS básico funciona</p>
        </div>
      </div>

      <div style={{ margin: '20px 0' }}>
        <h3>Test 2: Rueda y hamster</h3>
        <div className="wheel-and-hamster" style={{ border: '2px solid blue', margin: '10px auto', maxWidth: '200px' }}>
          <div className="wheel" style={{ border: '1px solid green' }}></div>
          <div className="hamster" style={{ border: '1px solid orange' }}>
            <div className="hamster__body" style={{ border: '1px solid purple' }}>
              <div className="hamster__head" style={{ border: '1px solid pink' }}>
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
      </div>

      <div style={{ margin: '20px 0' }}>
        <h3>Test 3: Animación simple</h3>
        <div style={{ 
          width: '50px', 
          height: '50px', 
          backgroundColor: 'red', 
          borderRadius: '50%',
          animation: 'spin 2s linear infinite',
          margin: '10px auto'
        }}></div>
        <style jsx>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>

      <div style={{ margin: '20px 0', fontSize: '12px', color: '#666' }}>
        <p><strong>Instrucciones:</strong></p>
        <p>1. Si ves el contenedor rojo, el CSS básico funciona</p>
        <p>2. Si ves elementos con bordes de colores, las clases CSS se aplican</p>
        <p>3. Si ves el círculo rojo girando, las animaciones CSS funcionan</p>
        <p>4. Si no ves nada, hay un problema con la carga del CSS</p>
      </div>
    </div>
  );
};

export default DebugHamsterLoader;
