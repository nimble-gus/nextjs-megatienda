import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useClientAuth } from '@/contexts/ClientAuthContext';
import { User, LogOut, ShoppingBag, Package, Settings } from 'lucide-react';
import LoginModal from './LoginModal';
import '@/styles/AuthButton.css';

const AuthButton = ({ showModal = true, onLoginClick }) => {
  const { user, isAuthenticated, logout } = useClientAuth();
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLoginClick = () => {
    if (isAuthenticated) {
      // Si está autenticado, toggle del menú de usuario
      toggleUserMenu();
    } else {
      // Si no está autenticado, siempre mostrar modal de login
      setShowLoginModal(true);
    }
  };

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
  };

  const handleOrdersClick = () => {
    setShowUserMenu(false);
    router.push('/orders');
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  // Cerrar menú cuando se hace click fuera
  const handleClickOutside = useCallback((event) => {
    if (showUserMenu && !event.target.closest('.auth-button-container')) {
      setShowUserMenu(false);
    }
  }, [showUserMenu]);

  // Agregar event listener para clicks fuera del menú
  useEffect(() => {
    if (showUserMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showUserMenu, handleClickOutside]);

  // Si está autenticado, mostrar botón de usuario con dropdown
  if (isAuthenticated) {
    return (
      <div className="auth-button-container">
        <button 
          className="auth-button user-button"
          onClick={handleLoginClick}
          title={`Hola, ${user?.nombre}`}
        >
          <User size={18} />
          <span className="auth-text">
            {user?.nombre ? user.nombre.split(' ')[0] : 'Usuario'}
          </span>
        </button>

        {/* Menú desplegable del usuario */}
        {showUserMenu && (
          <div className="user-dropdown">
            <div className="user-info">
              <div className="user-avatar">
                <User size={24} />
              </div>
              <div className="user-details">
                <div className="user-name">{user?.nombre}</div>
                <div className="user-email">{user?.correo}</div>
              </div>
            </div>
            
            <div className="dropdown-divider"></div>
            
            
            <button className="dropdown-item" onClick={handleOrdersClick}>
              <Package size={16} />
              <span>Historial de Pedidos</span>
            </button>
            
            
            <div className="dropdown-divider"></div>
            
            <button className="dropdown-item logout-item" onClick={handleLogout}>
              <LogOut size={16} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // Si no está autenticado, mostrar botón de login
  return (
    <>
      <button 
        className="auth-button login-button"
        onClick={handleLoginClick}
        title="Iniciar sesión"
      >
        <User size={18} />
        <span className="auth-text">Iniciar Sesión</span>
      </button>

      {/* Siempre mostrar el modal de login cuando no esté autenticado */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </>
  );
};

export default AuthButton;
