import React, { useState, useEffect } from 'react';
import Image from 'next/image'; // Componente optimizado de Next.js
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '@/styles/Header.css';
import LoginModal from '../Auth/LoginModal';

const Header = () => {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [searchFocused, setSearchFocused] = useState(false);
    const [headerVisible, setHeaderVisible] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [recentSearches, setRecentSearches] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Animación de entrada al cargar y verificar usuario guardado
    useEffect(() => {
        setTimeout(() => setHeaderVisible(true), 100);
        
        // Verificar estado de autenticación
        const checkAuthStatus = async () => {
            try {
                const response = await fetch('/api/auth/status', {
                    credentials: 'include'
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.isAuthenticated) {
                        // Si el token es válido, cargar datos del usuario desde localStorage
                        const savedUser = localStorage.getItem('user');
                        if (savedUser) {
                            try {
                                const userData = JSON.parse(savedUser);
                                setUser(userData);
                                loadUserCart(userData.id || userData.usuario_id);
                            } catch (error) {
                                console.error('Error parsing user data:', error);
                                localStorage.removeItem('user');
                            }
                        }
                    } else {
                        // Token inválido o expirado, limpiar sesión
                        console.warn('Token inválido, limpiando sesión...');
                        setUser(null);
                        setCartCount(0);
                        localStorage.removeItem('user');
                    }
                } else {
                    // Error en la verificación, limpiar sesión
                    console.warn('Error verificando autenticación, limpiando sesión...');
                    setUser(null);
                    setCartCount(0);
                    localStorage.removeItem('user');
                }
            } catch (error) {
                console.error('Error checking auth status:', error);
                // En caso de error, mantener el estado actual
            }
        };

        checkAuthStatus();

        // Cargar búsquedas recientes
        loadRecentSearches();
    }, []);

    // Función para cargar el carrito del usuario
    const loadUserCart = async (userId) => {
        try {
            console.log('🛒 Cargando carrito para usuario:', userId);
            const response = await fetch(`/api/cart/${userId}`, {
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
            
            if (response.ok) {
                const cartData = await response.json();
                if (cartData.success && cartData.items) {
                    const totalItems = cartData.items.reduce((total, item) => total + (item.cantidad || 0), 0);
                    console.log('🛒 Total de items en carrito:', totalItems);
                    setCartCount(totalItems);
                } else {
                    console.warn('Respuesta del carrito sin formato esperado:', cartData);
                    setCartCount(0);
                }
            } else if (response.status === 401) {
                // Token expirado o inválido - limpiar sesión
                console.warn('Token expirado o inválido, limpiando sesión...');
                setUser(null);
                setCartCount(0);
                localStorage.removeItem('user');
                window.dispatchEvent(new CustomEvent('logout'));
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error('Error cargando carrito:', response.status, errorData.error || response.statusText);
                setCartCount(0);
            }
        } catch (error) {
            console.error('Error cargando carrito:', error.message);
            setCartCount(0);
        }
    };

    // Función para actualizar el contador del carrito
    const updateCartCount = () => {
        if (user) {
            loadUserCart(user.id || user.usuario_id);
        }
    };

    // Escuchar cambios en el carrito (evento personalizado)
    useEffect(() => {
        const handleCartUpdate = () => {
            console.log('🔄 Evento cartUpdated recibido, actualizando contador...');
            updateCartCount();
        };

        window.addEventListener('cartUpdated', handleCartUpdate);
        
        return () => {
            window.removeEventListener('cartUpdated', handleCartUpdate);
        };
    }, [user]);

    // Manejar éxito del login
    const handleLoginSuccess = (data) => {
        console.log('Login exitoso:', data);
        
        const userData = data.user || data;
        setUser(userData);
        
        localStorage.setItem('user', JSON.stringify(userData));
        // Los tokens ahora se manejan automáticamente por cookies HttpOnly
        
        loadUserCart(userData.id || userData.usuario_id);
        setShowLoginModal(false);
        
        // Disparar evento de login exitoso
        window.dispatchEvent(new CustomEvent('loginSuccess'));
        
        console.log(`¡Bienvenido ${userData.nombre}!`);
    };

    // Manejar logout
    const handleLogout = async () => {
        try {
            // Llamar a la API de logout para eliminar cookies
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
        } catch (error) {
            console.error('Error en logout:', error);
        }
        
        setUser(null);
        setCartCount(0);
        
        localStorage.removeItem('user');
        
        // Disparar evento de logout
        window.dispatchEvent(new CustomEvent('logout'));
        
        console.log('Sesión cerrada correctamente');
    };

    // Función para cargar búsquedas recientes
    const loadRecentSearches = () => {
        try {
            const saved = localStorage.getItem('recentSearches');
            if (saved) {
                const searches = JSON.parse(saved);
                setRecentSearches(searches);
            }
        } catch (error) {
            console.error('Error cargando búsquedas recientes:', error);
        }
    };

    // Función para guardar una búsqueda reciente
    const saveRecentSearch = (query) => {
        try {
            const trimmedQuery = query.trim().toLowerCase();
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
                        <a href="/" className="nav-link">
                            <span>Inicio</span>
                            <div className="nav-underline"></div>
                        </a>
                    </li>
                    <li className="nav-item">
                        <a href="/catalog" className="nav-link">
                            <span>Catálogo</span>
                            <div className="nav-underline"></div>
                        </a>
                    </li>
                    <li className="nav-item">
                        <a href="/contact" className="nav-link">
                            <span>Contacto</span>
                            <div className="nav-underline"></div>
                        </a>
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
                {!isLoggedIn && (
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
                {isLoggedIn && (
                    <div className="user-actions">
                        <div className="cart-container">
                            <a href="/cart" className="cart-link">
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
                            </a>
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