import React, { useState, useEffect } from 'react';
import '@/styles/Header.css';
import logo from '@/assets/logo.png';
import cartIcon from '@/assets/bag.svg';
import userIcon from '@/assets/user.svg';
import searchIcon from '@/assets/sch.svg';
import LoginModal from '../Auth/LoginModal'; // Ajusta la ruta según tu estructura

const Header = () => {
    const [user, setUser] = useState(null); // Cambié isLoggedIn por user para guardar info completa
    const [searchFocused, setSearchFocused] = useState(false);
    const [headerVisible, setHeaderVisible] = useState(false);
    const [cartCount, setCartCount] = useState(0); // Inicia en 0
    const [showLoginModal, setShowLoginModal] = useState(false);

    // Animación de entrada al cargar y verificar usuario guardado
    useEffect(() => {
        setTimeout(() => setHeaderVisible(true), 100);
        
        // Verificar si hay usuario logueado en localStorage
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                const userData = JSON.parse(savedUser);
                setUser(userData);
                loadUserCart(userData.id || userData.usuario_id);
            } catch (error) {
                console.error('Error parsing saved user:', error);
                localStorage.removeItem('user'); // Limpiar datos corruptos
            }
        }
    }, []);

    // Función para cargar el carrito del usuario
    const loadUserCart = async (userId) => {
        try {
            // Aquí harías tu llamada real a la API
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/carrito/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const cartItems = await response.json();
                const totalItems = cartItems.reduce((total, item) => total + item.cantidad, 0);
                setCartCount(totalItems);
            } else {
                console.error('Error cargando carrito:', response.statusText);
            }
        } catch (error) {
            console.error('Error cargando carrito:', error);
            // Simulación para desarrollo - remover en producción
            setTimeout(() => setCartCount(3), 500);
        }
    };

    // Manejar éxito del login
    const handleLoginSuccess = (data) => {
        console.log('Login exitoso:', data);
        
        // Guardar usuario completo
        const userData = data.user || data;
        setUser(userData);
        
        // Guardar en localStorage para persistencia
        localStorage.setItem('user', JSON.stringify(userData));
        if (data.token) {
            localStorage.setItem('token', data.token);
        }
        
        // Cargar carrito del usuario
        loadUserCart(userData.id || userData.usuario_id);
        
        // Cerrar modal
        setShowLoginModal(false);
        
        // Opcional: mostrar notificación de éxito
        console.log(`¡Bienvenido ${userData.nombre}!`);
    };

    // Manejar logout
    const handleLogout = () => {
        setUser(null);
        setCartCount(0);
        
        // Limpiar localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        
        console.log('Sesión cerrada correctamente');
    };

    // Verificar si está logueado
    const isLoggedIn = !!user;

    return (
        <header className={`main-header ${headerVisible ? 'header-visible' : ''}`}>
            {/* Logo con animación */}
            <div className="logo">
                <img src={logo} alt="Logo LaMegaTiendaGT" className="logo-img" />
            </div>

            {/* Menú con efectos hover */}
            <nav className="main-nav">
                <ul>
                    <li className="nav-item">
                        <span>Inicio</span>
                        <div className="nav-underline"></div>
                    </li>
                    <li className="nav-item">
                        <span>Catálogo</span>
                        <div className="nav-underline"></div>
                    </li>
                    <li className="nav-item">
                        <span>Categorías</span>
                        <div className="nav-underline"></div>
                    </li>
                    <li className="nav-item">
                        <span>Contacto</span>
                        <div className="nav-underline"></div>
                    </li>
                </ul>
            </nav>

            {/* Acciones con animaciones */}
            <div className="header-actions">
                <div className={`search-container ${searchFocused ? 'search-focused' : ''}`}>
                    <div className="search-box">
                        <input 
                            type="text" 
                            placeholder="Busca tu producto" 
                            onFocus={() => setSearchFocused(true)}
                            onBlur={() => setSearchFocused(false)}
                        />
                        <button className="search-btn">
                            <img src={searchIcon} alt="Buscar" className="search-icon" />
                        </button>
                    </div>
                    <div className="search-suggestions">
                        <div className="suggestion">Caminadora iWalk Pro</div>
                        <div className="suggestion">Yoga Mat 6MM</div>
                        <div className="suggestion">Cama de Pilates</div>
                    </div>
                </div>

                {/* Botón de login cuando no está logueado */}
                {!isLoggedIn && (
                    <button 
                        className="login-btn" 
                        onClick={() => setShowLoginModal(true)}
                    >
                        <span>Login</span>
                        <div className="btn-glow"></div>
                    </button>
                )}

                {/* Acciones del usuario logueado */}
                {isLoggedIn && (
                    <div className="user-actions">
                        <div className="cart-container">
                            <img src={cartIcon} alt="Carrito" className="icon-btn cart-icon" />
                            {cartCount > 0 && (
                                <span className="cart-badge">{cartCount}</span>
                            )}
                        </div>
                        <div className="user-container">
                            <img src={userIcon} alt="Usuario" className="icon-btn user-icon" />
                            <div className="user-dropdown">
                                {/* Información del usuario */}
                                <div className="user-info">
                                    <strong>{user.nombre}</strong>
                                </div>
                                <div className="dropdown-divider"></div>
                                
                                {/* Opciones del menú */}
                                <div className="dropdown-item">
                                    📦 Mis Pedidos
                                </div>

                                <div className="dropdown-divider"></div>
                                <div 
                                    className="dropdown-item logout"
                                    onClick={handleLogout}
                                >
                                    🚪 Cerrar Sesión
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Hamburger menu para móvil */}
            <div className="mobile-menu-btn">
                <span></span>
                <span></span>
                <span></span>
            </div>

            {/* Modal de login */}
            {showLoginModal && (
                <LoginModal 
                    onClose={() => setShowLoginModal(false)} 
                    onLoginSuccess={handleLoginSuccess}
                />
            )}
        </header>
    );
};

export default Header;