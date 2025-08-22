import InlineHamsterLoader from '@/components/common/InlineHamsterLoader';

export default function TestInlineHamsterPage() {
  return (
    <div style={{ 
      padding: '50px', 
      textAlign: 'center', 
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <h1>🧪 Test del HamsterLoader con CSS Inline</h1>
      
      <div style={{ margin: '30px 0' }}>
        <h3>HamsterLoader Pequeño:</h3>
        <InlineHamsterLoader size="small" message="Cargando..." />
      </div>
      
      <div style={{ margin: '30px 0' }}>
        <h3>HamsterLoader Mediano:</h3>
        <InlineHamsterLoader size="medium" message="Procesando datos..." />
      </div>
      
      <div style={{ margin: '30px 0' }}>
        <h3>HamsterLoader Grande:</h3>
        <InlineHamsterLoader size="large" message="Inicializando sistema..." />
      </div>
      
      <div style={{ margin: '30px 0' }}>
        <h3>HamsterLoader sin mensaje:</h3>
        <InlineHamsterLoader size="medium" showMessage={false} />
      </div>
    </div>
  );
}
