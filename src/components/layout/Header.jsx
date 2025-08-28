import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '@/styles/Header.css';
import LoginModal from '../Auth/LoginModal';
import { useAuth } from '@/contexts/AuthContext';

const Header = () => {
    const router = useRouter();
    const { user, isAuthenticated, logout, updateUser } = useAuth();
    const [searchFocused, setSearchFocused] = useState(false);
    const [headerVisible, setHeaderVisible] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [recentSearches, setRecentSearches] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Animación de entrada al cargar
    useEffect(() => {
        setTimeout(() => setHeaderVisible(true), 100);
        
        // Cargar búsquedas recientes
        loadRecentSearches();
    }, []);

    // Cargar carrito cuando el usuario esté autenticado
    useEffect(() => {
        if (isAuthenticated && user) {
            loadUserCart(user.id || user.usuario_id);
        } else {
            setCartCount(0);
        }
    }, [isAuthenticated, user]);

    // Función para cargar el carrito del usuario
    const loadUserCart = async (userId) => {
        try {
            console.log('🛒 Cargando carrito para usuario:', userId);
            const token = localStorage.getItem('token');
            
            // Agregar timestamp para evitar caché del navegador
            const timestamp = new Date().getTime();
            const response = await fetch(`/api/cart/${userId}?_t=${timestamp}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });
            
            if (response.ok) {
                const cartData = await response.json();
                if (cartData.success && cartData.items) {
                    const totalItems = cartData.items.reduce((total, item) => total + (item.cantidad || 0), 0);
                    setCartCount(totalItems);
                    console.log(`🛒 Carrito cargado: ${totalItems} items`);
                }
            }
        } catch (error) {
            console.error('Error cargando carrito:', error);
        }
    };

    // Actualizar contador del carrito
    const updateCartCount = async () => {
        if (isAuthenticated && user) {
            await loadUserCart(user.id || user.usuario_id);
        }
    };

    // Escuchar eventos de actualización del carrito
    useEffect(() => {
        const handleCartUpdate = () => {
            console.log('🔄 Evento cartUpdated recibido, actualizando contador...');
            updateCartCount();
        };

        const handleCartCleared = () => {
            console.log('🔄 Evento cartCleared recibido, limpiando contador...');
            setCartCount(0);
        };

        const handleCartStateChanged = (event) => {
            console.log('🔄 Evento cartStateChanged recibido:', event.detail);
            if (event.detail?.action === 'cleared') {
                setCartCount(0);
            } else {
                updateCartCount();
            }
        };

        // Escuchar el evento cartUpdated
        window.addEventListener('cartUpdated', handleCartUpdate);
        
        // Escuchar el evento cartCleared
        window.addEventListener('cartCleared', handleCartCleared);
        
        // Escuchar el evento cartStateChanged
        window.addEventListener('cartStateChanged', handleCartStateChanged);
        
        // También escuchar el evento loginSuccess para actualizar el carrito
        const handleLoginSuccess = () => {
            console.log('🔄 Login exitoso, actualizando carrito...');
            if (isAuthenticated && user) {
                updateCartCount();
            }
        };
        
        window.addEventListener('loginSuccess', handleLoginSuccess);
        
        return () => {
            window.removeEventListener('cartUpdated', handleCartUpdate);
            window.removeEventListener('cartCleared', handleCartCleared);
            window.removeEventListener('cartStateChanged', handleCartStateChanged);
            window.removeEventListener('loginSuccess', handleLoginSuccess);
        };
    }, [isAuthenticated, user]);

    // Actualizar carrito periódicamente cada 30 segundos si el usuario está autenticado
    useEffect(() => {
        if (!isAuthenticated || !user) return;

        const interval = setInterval(() => {
            console.log('🔄 Actualización periódica del carrito...');
            updateCartCount();
        }, 30000); // 30 segundos

        return () => clearInterval(interval);
    }, [isAuthenticated, user]);

    // Manejar éxito del login
    const handleLoginSuccess = (data) => {
        console.log('Login exitoso:', data);
        
        const userData = data.user || data;
        updateUser(userData);
        
        loadUserCart(userData.id || userData.usuario_id);
        setShowLoginModal(false);
        
        // Disparar evento de login exitoso
        window.dispatchEvent(new CustomEvent('loginSuccess'));
        
        console.log(`¡Bienvenido ${userData.nombre}!`);
    };

    // Manejar logout
    const handleLogout = async () => {
        try {
            await logout();
            setCartCount(0);
            
            // Disparar evento de logout
            window.dispatchEvent(new CustomEvent('logout'));
            
            console.log('👋 Sesión cerrada exitosamente');
        } catch (error) {
            console.error('Error en logout:', error);
        }
    };

    // Cargar búsquedas recientes desde localStorage
    const loadRecentSearches = () => {
        try {
            const saved = localStorage.getItem('recentSearches');
            if (saved) {
                setRecentSearches(JSON.parse(saved));
            }
        } catch (error) {
            console.error('Error cargando búsquedas recientes:', error);
        }
    };

    // Guardar búsqueda reciente
    const saveRecentSearch = (query) => {
        try {
            const trimmedQuery = query.trim();
            if (!trimmedQuery) return;

            const currentSearches = [...recentSearches];
            
            // Remover si ya existe
            const existingIndex = currentSearches.findIndex(
                search => search.toLowerCase() === trimmedQuery
            );
            if (existingIndex > -1) {
                currentSearches.splice(existingIndex, 1);
            }
            
            // Agregar al inicio
            currentSearches.unshift(trimmedQuery);
            
            // Mantener solo las últimas 5 búsquedas
            const limitedSearches = currentSearches.slice(0, 5);
            
            setRecentSearches(limitedSearches);
            localStorage.setItem('recentSearches', JSON.stringify(limitedSearches));
        } catch (error) {
            console.error('Error guardando búsqueda reciente:', error);
        }
    };

    // Función para manejar la búsqueda
    const handleSearch = (e) => {
        e.preventDefault();
        
        if (searchQuery.trim()) {
            // Guardar búsqueda reciente
            saveRecentSearch(searchQuery);
            
            // Redirigir al catálogo con el término de búsqueda
            const encodedQuery = encodeURIComponent(searchQuery.trim());
            router.push(`/catalog?search=${encodedQuery}`);
            
            // Limpiar el campo de búsqueda y ocultar sugerencias
            setSearchQuery('');
            setShowSuggestions(false);
        }
    };

    // Función para manejar la búsqueda al hacer click en la lupa
    const handleSearchClick = () => {
        if (searchQuery.trim()) {
            // Guardar búsqueda reciente
            saveRecentSearch(searchQuery);
            
            const encodedQuery = encodeURIComponent(searchQuery.trim());
            router.push(`/catalog?search=${encodedQuery}`);
            setSearchQuery('');
            setShowSuggestions(false);
        }
    };

    // Función para manejar la búsqueda al presionar Enter
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch(e);
        }
    };

    // Función para manejar click en una sugerencia
    const handleSuggestionClick = (suggestion) => {
        setSearchQuery(suggestion);
        saveRecentSearch(suggestion);
        const encodedQuery = encodeURIComponent(suggestion);
        router.push(`/catalog?search=${encodedQuery}`);
        setShowSuggestions(false);
    };

    // Función para limpiar búsquedas recientes
    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem('recentSearches');
    };

    // Función para abrir/cerrar menú móvil
    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
        // Prevenir scroll del body cuando el menú está abierto
        if (!mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    };

    // Función para cerrar menú móvil
    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
        document.body.style.overflow = 'auto';
    };

    // Función para manejar búsqueda móvil
    const handleMobileSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            saveRecentSearch(searchQuery);
            const encodedQuery = encodeURIComponent(searchQuery.trim());
            router.push(`/catalog?search=${encodedQuery}`);
            setSearchQuery('');
            closeMobileMenu();
        }
    };

    return (
        <>
            <header className={`main-header ${headerVisible ? 'header-visible' : ''}`}>
                {/* Logo con animación - usando Next.js Image */}
                <div className="logo">
                    <Link href="/">
                        <Image 
                            src="/assets/logo.png" 
                            alt="Logo LaMegaTiendaGT" 
                            width={120} 
                            height={40}
                            className="logo-img"
                            style={{ width: 'auto', height: 'auto' }}
                            priority // Para cargar la imagen inmediatamente
                        />
                    </Link>
                </div>

                {/* Menú con efectos hover */}
                <nav className="main-nav">
                    <ul>
                        <li className="nav-item">
                            <Link href="/" className="nav-link">
                                <span>Inicio</span>
                                <div className="nav-underline"></div>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link href="/catalog" className="nav-link">
                                <span>Catálogo</span>
                                <div className="nav-underline"></div>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link href="/contact" className="nav-link">
                                <span>Contacto</span>
                                <div className="nav-underline"></div>
                            </Link>
                        </li>
                    </ul>
                </nav>

                {/* Acciones con animaciones */}
                <div className="header-actions">
                    <div className={`search-container ${searchFocused ? 'search-focused' : ''}`}>
                        <form onSubmit={handleSearch} className="search-box">
                            <input 
                                type="text" 
                                placeholder="Busca tu producto" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => {
                                    setSearchFocused(true);
                                    setShowSuggestions(true);
                                }}
                                onBlur={() => {
                                    setSearchFocused(false);
                                    // Delay para permitir clicks en sugerencias
                                    setTimeout(() => setShowSuggestions(false), 200);
                                }}
                                onKeyPress={handleKeyPress}
                            />
                            <button 
                                type="button" 
                                className="search-btn"
                                onClick={handleSearchClick}
                                suppressHydrationWarning
                            >
                                <Image 
                                    src="/assets/sch.svg" 
                                    alt="Buscar" 
                                    width={20} 
                                    height={20}
                                    className="search-icon" 
                                />
                            </button>
                        </form>
                        {showSuggestions && (
                            <div className="search-suggestions">
                                {recentSearches.length > 0 ? (
                                    <>
                                        <div className="suggestions-header">
                                            <span>Búsquedas recientes</span>
                                            <button 
                                                className="clear-searches-btn"
                                                onClick={clearRecentSearches}
                                                title="Limpiar historial"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                        {recentSearches.map((search, index) => (
                                            <div 
                                                key={index}
                                                className="suggestion recent-search"
                                                onClick={() => handleSuggestionClick(search)}
                                            >
                                                <span className="search-icon">🔍</span>
                                                <span className="search-text">{search}</span>
                                            </div>
                                        ))}
                                    </>
                                ) : (
                                    <div className="no-searches">
                                        <span>No hay búsquedas recientes</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Botón de login cuando no está logueado */}
                    {!isAuthenticated && (
                        <button 
                            className="login-btn" 
                            onClick={() => setShowLoginModal(true)}
                            suppressHydrationWarning
                        >
                            <span>Login</span>
                            <div className="btn-glow"></div>
                        </button>
                    )}

                    {/* Acciones del usuario logueado */}
                    {isAuthenticated && (
                        <div className="user-actions">
                            <div className="cart-container">
                                <Link href="/cart" className="cart-link">
                                    <Image 
                                        src="/assets/bag.svg" 
                                        alt="Carrito" 
                                        width={24} 
                                        height={24}
                                        className="icon-btn cart-icon" 
                                    />
                                    {cartCount > 0 && (
                                        <span className="cart-badge">
                                            {cartCount > 99 ? '99+' : cartCount}
                                        </span>
                                    )}
                                </Link>
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
                                        <strong>{user?.nombre || 'Usuario'}</strong>
                                    </div>
                                    <div className="dropdown-divider"></div>
                                    
                                    <Link href="/orders" className="dropdown-item">
                                        📦 Mis Pedidos
                                    </Link>

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
                <div className="mobile-menu-btn" onClick={toggleMobileMenu}>
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

            {/* Menú móvil */}
            <div className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
                <div className="mobile-menu-header">
                    <span>Menú</span>
                    <button className="mobile-menu-close" onClick={closeMobileMenu}>
                        ✕
                    </button>
                </div>
                
                <nav className="mobile-nav">
                    <ul>
                        <li>
                            <Link href="/" onClick={closeMobileMenu}>
                                🏠 Inicio
                            </Link>
                        </li>
                        <li>
                            <Link href="/catalog" onClick={closeMobileMenu}>
                                📦 Catálogo
                            </Link>
                        </li>
                        <li>
                            <Link href="/contact" onClick={closeMobileMenu}>
                                📞 Contacto
                            </Link>
                        </li>
                    </ul>
                </nav>

                <div className="mobile-search">
                    <form onSubmit={handleMobileSearch} className="search-box">
                        <input 
                            type="text" 
                            placeholder="Busca tu producto" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button type="submit" className="search-btn">
                            <Image 
                                src="/assets/sch.svg" 
                                alt="Buscar" 
                                width={20} 
                                height={20}
                                className="search-icon" 
                            />
                        </button>
                    </form>
                </div>

                <div className="mobile-user-actions">
                    {!isAuthenticated ? (
                        <button 
                            className="login-btn" 
                            onClick={() => {
                                setShowLoginModal(true);
                                closeMobileMenu();
                            }}
                        >
                            <span>Iniciar Sesión</span>
                            <div className="btn-glow"></div>
                        </button>
                    ) : (
                        <div className="user-actions">
                            <Link href="/orders" className="dropdown-item" onClick={closeMobileMenu}>
                                📦 Mis Pedidos
                            </Link>
                            
                            <div 
                                className="dropdown-item logout"
                                onClick={() => {
                                    handleLogout();
                                    closeMobileMenu();
                                }}
                            >
                                🚪 Cerrar Sesión
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Overlay para cerrar menú móvil */}
            <div 
                className={`mobile-overlay ${mobileMenuOpen ? 'active' : ''}`}
                onClick={closeMobileMenu}
            ></div>
        </>
    );
};

export default Header;