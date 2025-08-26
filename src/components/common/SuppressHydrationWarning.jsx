'use client';

// Componente wrapper para suprimir warnings de hidratación
const SuppressHydrationWarning = ({ children, ...props }) => {
  return (
    <div suppressHydrationWarning {...props}>
      {children}
    </div>
  );
};

export default SuppressHydrationWarning;
