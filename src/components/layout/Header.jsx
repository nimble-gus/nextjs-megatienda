import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthButton from '@/components/auth/AuthButton';
import CartButton from '@/components/cart/CartButton';
import '@/styles/Header.css';

const Header = ({ onLoginClick }) => {
    const router = useRouter();
    const [searchFocused, setSearchFocused] = useState(false);
    const [headerVisible, setHeaderVisible] = useState(false);
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
                    
                    {/* Botones de usuario y carrito */}
                    <div className="user-actions">
                        <CartButton />
                        <AuthButton showModal={false} onLoginClick={onLoginClick} />
                    </div>
                </div>

                {/* Hamburger menu para móvil */}
                <div className="mobile-menu-btn" onClick={toggleMobileMenu}>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
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