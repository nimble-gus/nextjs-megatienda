import React, { useEffect, useState } from 'react';
import '@/styles/Topbar.css';

const Topbar = () => {
    const [mensaje, setMensaje] = useState('Envío GRATIS en todos los pedidos');
    const [isVisible, setIsVisible] = useState(false);
    const [currentPromo, setCurrentPromo] = useState(0);
    
    const promociones = [
        'Envío GRATIS en todos los pedidos',
        '20% OFF en compras mayores a Q500',
        'Nuevos productos cada semana',
        'Soporte 24/7 para nuestros clientes'
    ];

    useEffect(() => {
        // Animación de entrada
        setTimeout(() => setIsVisible(true), 100);
        
        // Rotación de promociones cada 5 segundos
        const interval = setInterval(() => {
            setCurrentPromo((prev) => (prev + 1) % promociones.length);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        setMensaje(promociones[currentPromo]);
    }, [currentPromo]);

    const handlePhoneClick = () => {
        // Añadir efecto de vibración si está disponible
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    };

    // Componente de ícono de envío
    const ShippingIcon = () => (
        <svg className="topbar-svg-icon shipping-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="1" y="3" width="15" height="13"></rect>
            <polygon points="16,8 20,8 23,11 23,16 16,16"></polygon>
            <circle cx="5.5" cy="18.5" r="2.5"></circle>
            <circle cx="18.5" cy="18.5" r="2.5"></circle>
        </svg>
    );

    // Componente de ícono de teléfono
    const PhoneIcon = () => (
        <svg className="topbar-svg-icon phone-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
        </svg>
    );

    return (
        <div className={`topbar ${isVisible ? 'topbar-visible' : ''}`}>
            {/* Efecto de partículas de fondo */}
            <div className="topbar-particles">
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
            </div>

            <div className="topbar-content">
                <div className="topbar-left">
                    <div className="promo-container">
                        <ShippingIcon />
                        <span className="promo-text">{mensaje}</span>
                        <div className="promo-indicator">
                            {promociones.map((_, index) => (
                                <div 
                                    key={index} 
                                    className={`indicator-dot ${index === currentPromo ? 'active' : ''}`}
                                ></div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="topbar-right">
                    <div className="contact-container">
                        <PhoneIcon />
                        <a 
                            href="tel:+50222258889" 
                            className="phone-link"
                            onClick={handlePhoneClick}
                        >
                            +(502) 2225-8889
                        </a>
                        <div className="call-tooltip">Click para llamar</div>
                    </div>
                </div>
            </div>

            {/* Barra de progreso para la rotación de promociones */}
            <div className="progress-bar">
                <div className="progress-fill"></div>
            </div>
        </div>
    );
};

export default Topbar;