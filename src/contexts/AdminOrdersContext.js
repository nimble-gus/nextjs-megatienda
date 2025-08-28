'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getPendingOrdersCount } from '@/services/ordersService';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

const AdminOrdersContext = createContext();

export const useAdminOrders = () => {
  const context = useContext(AdminOrdersContext);
  if (!context) {
    throw new Error('useAdminOrders debe ser usado dentro de AdminOrdersProvider');
  }
  return context;
};

export const AdminOrdersProvider = ({ children }) => {
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const { isAdminAuthenticated, isLoading: adminAuthLoading } = useAdminAuth();

  // Función para cargar el conteo de órdenes pendientes
  const loadPendingOrdersCount = useCallback(async () => {
    try {
      setIsLoading(true);
      const count = await getPendingOrdersCount();
      setPendingOrdersCount(count);
      setLastUpdate(new Date());
      
    } catch (error) {
      console.error('Error cargando órdenes pendientes:', error);
      // Si es error de autenticación o autorización, no mostrar error en consola
      if (error.message && (error.message.includes('401') || error.message.includes('403'))) {

        setPendingOrdersCount(0);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Función para actualizar el conteo manualmente
  const updatePendingOrdersCount = (newCount) => {
    setPendingOrdersCount(newCount);
    setLastUpdate(new Date());
    
  };

  // Función para incrementar el conteo (cuando llega una nueva orden)
  const incrementPendingOrders = () => {
    setPendingOrdersCount(prev => {
      const newCount = prev + 1;
      
      return newCount;
    });
    setLastUpdate(new Date());
  };

  // Función para decrementar el conteo (cuando se procesa una orden)
  const decrementPendingOrders = () => {
    setPendingOrdersCount(prev => {
      const newCount = Math.max(0, prev - 1);
      
      return newCount;
    });
    setLastUpdate(new Date());
  };

  // Función para resetear el conteo
  const resetPendingOrders = () => {
    setPendingOrdersCount(0);
    setLastUpdate(new Date());
    
  };

  // Cargar datos iniciales solo si el admin está autenticado
  useEffect(() => {
    // Esperar a que la autenticación del admin se complete
    if (adminAuthLoading) {
      return;
    }

    if (isAdminAuthenticated) {
      // Agregar un pequeño delay para asegurar que las cookies estén disponibles
      const timer = setTimeout(() => {
        loadPendingOrdersCount();
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      setPendingOrdersCount(0);
    }
  }, [isAdminAuthenticated, adminAuthLoading, loadPendingOrdersCount]);

  // Actualizar periódicamente cada 30 segundos solo si el admin está autenticado
  useEffect(() => {
    // Esperar a que la autenticación del admin se complete
    if (adminAuthLoading || !isAdminAuthenticated) {
      return;
    }

    const interval = setInterval(() => {
      loadPendingOrdersCount();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [isAdminAuthenticated, adminAuthLoading, loadPendingOrdersCount]);

  // Escuchar eventos de nuevas órdenes
  useEffect(() => {
    const handleNewOrder = () => {
      
      incrementPendingOrders();
    };

    const handleOrderProcessed = () => {
      
      decrementPendingOrders();
    };

    const handleOrdersUpdated = () => {
      
      loadPendingOrdersCount();
    };

    // Escuchar eventos personalizados
    window.addEventListener('newOrderCreated', handleNewOrder);
    window.addEventListener('orderProcessed', handleOrderProcessed);
    window.addEventListener('ordersUpdated', handleOrdersUpdated);

    return () => {
      window.removeEventListener('newOrderCreated', handleNewOrder);
      window.removeEventListener('orderProcessed', handleOrderProcessed);
      window.removeEventListener('ordersUpdated', handleOrdersUpdated);
    };
  }, []);

  const value = {
    pendingOrdersCount,
    isLoading,
    lastUpdate,
    loadPendingOrdersCount,
    updatePendingOrdersCount,
    incrementPendingOrders,
    decrementPendingOrders,
    resetPendingOrders
  };

  return (
    <AdminOrdersContext.Provider value={value}>
      {children}
    </AdminOrdersContext.Provider>
  );
};
