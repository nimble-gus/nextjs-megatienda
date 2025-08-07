import React, { useState, useEffect } from 'react';
import Image from 'next/image'; // Componente optimizado de Next.js
import '@/styles/Header.css';
import LoginModal from '../Auth/LoginModal';

const Header = () => {
    const [user, setUser] = useState(null);
    const [searchFocused, setSearchFocused] = useState(false);
    const [headerVisible, setHeaderVisible] = useState(false);
    const [cartCount, setCartCount] = useState(0);
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
                localStorage.removeItem('user');
            }
        }
    }, []);

    // Función para cargar el carrito del usuario
    const loadUserCart = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/carrito/${userId}`, {
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
            // Simulación para desarrollo
            setTimeout(() => setCartCount(3), 500);
        }
    };

    // Manejar éxito del login
    const handleLoginSuccess = (data) => {
        console.log('Login exitoso:', data);
        
        const userData = data.user || data;
        setUser(userData);
        
        localStorage.setItem('user', JSON.stringify(userData));
        if (data.token) {
            localStorage.setItem('token', data.token);
        }
        
        loadUserCart(userData.id || userData.usuario_id);
        setShowLoginModal(false);
        
        console.log(`¡Bienvenido ${userData.nombre}!`);
    };

    // Manejar logout
    const handleLogout = () => {
        setUser(null);
        setCartCount(0);
        
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        
        console.log('Sesión cerrada correctamente');
    };

    const isLoggedIn = !!user;

    return (
        <header className={`main-header ${headerVisible ? 'header-visible' : ''}`}>
            {/* Logo con animación - usando Next.js Image */}
            <div className="logo">
                <Image 
                    src="/assets/logo.png" 
                    alt="Logo LaMegaTiendaGT" 
                    width={120} 
                    height={40}
                    className="logo-img"
                    priority // Para cargar la imagen inmediatamente
                />
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
                            <Image 
                                src="/assets/sch.svg" 
                                alt="Buscar" 
                                width={20} 
                                height={20}
                                className="search-icon" 
                            />
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
                            <Image 
                                src="/assets/bag.svg" 
                                alt="Carrito" 
                                width={24} 
                                height={24}
                                className="icon-btn cart-icon" 
                            />
                            {cartCount > 0 && (
                                <span className="cart-badge">{cartCount}</span>
                            )}
                        </div>
                        <div className="user-container">
                            <Image 
                                src="/assets/user.svg" 
                                alt="Usuario" 
                                width={24} 
                                height={24}
                                className="icon-btn user-icon" 
                            />
                            <div className="user-dropdown">
                                <div className="user-info">
                                    <strong>{user.nombre}</strong>
                                </div>
                                <div className="dropdown-divider"></div>
                                
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