'use client';

import { createContext, useContext } from 'react';
import { useAuth } from '@/hooks/useAuth';

// Contexto de autenticación del cliente
const ClientAuthContext = createContext();

// Hook para usar el contexto
export const useClientAuth = () => {
  const context = useContext(ClientAuthContext);
  if (!context) {
    throw new Error('useClientAuth debe ser usado dentro de ClientAuthProvider');
  }
  return context;
};

// Provider del contexto
export const ClientAuthProvider = ({ children }) => {
  // Usar el hook de autenticación optimizado
  const auth = useAuth();

  return (
    <ClientAuthContext.Provider value={auth}>
      {children}
    </ClientAuthContext.Provider>
  );
};
