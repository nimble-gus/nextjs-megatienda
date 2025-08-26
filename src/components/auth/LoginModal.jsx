'use client';
import { useState, useEffect } from 'react';
import '../../styles/LoginModal.css';

const LoginModal = ({ onClose, onLoginSuccess }) => {
    const [isRegister, setIsRegister] = useState(false);
    const [formData, setFormData] = useState({ 
        nombre: '', 
        correo: '', 
        contraseña: '',
        confirmarContraseña: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    // Animación de entrada
    useEffect(() => {
        setTimeout(() => setModalVisible(true), 50);
        
        // Cerrar con ESC
        const handleEsc = (e) => {
            if (e.keyCode === 27) handleClose();
        };
        document.addEventListener('keydown', handleEsc);
        document.body.style.overflow = 'hidden';
        
        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, []);

    // Limpiar formulario al cambiar modo
    useEffect(() => {
        setFormData({ 
            nombre: '', 
            correo: '', 
            contraseña: '',
            confirmarContraseña: ''
        });
        setErrors({});
    }, [isRegister]);

    const handleClose = () => {
        setModalVisible(false);
        setTimeout(() => onClose(), 300);
    };

    const validateForm = () => {
        const newErrors = {};

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.correo) {
            newErrors.correo = 'El email es requerido';
        } else if (!emailRegex.test(formData.correo)) {
            newErrors.correo = 'Email inválido';
        }

        // Validar contraseña
        if (!formData.contraseña) {
            newErrors.contraseña = 'La contraseña es requerida';
        } else if (formData.contraseña.length < 6) {
            newErrors.contraseña = 'Mínimo 6 caracteres';
        }

        // Validaciones para registro
        if (isRegister) {
            if (!formData.nombre) {
                newErrors.nombre = 'El nombre es requerido';
            } else if (formData.nombre.length < 2) {
                newErrors.nombre = 'Mínimo 2 caracteres';
            }
            
            if (formData.contraseña !== formData.confirmarContraseña) {
                newErrors.confirmarContraseña = 'Las contraseñas no coinciden';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        
        // Limpiar error del campo al escribir
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setIsLoading(true);
        setErrors({});

        try {
            // URLs corregidas para Next.js - usar rutas relativas
            const url = isRegister 
                ? '/api/auth/register'
                : '/api/auth/login';

            const submitData = isRegister 
                ? { nombre: formData.nombre, correo: formData.correo, contraseña: formData.contraseña }
                : { correo: formData.correo, contraseña: formData.contraseña };
            const res = await fetch(url, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(submitData),
            });
            // Verificar si la respuesta es JSON
            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('La respuesta del servidor no es JSON válido');
            }

            const data = await res.json();
            if (res.ok) {
                // Animación de éxito
                setModalVisible(false);
                setTimeout(() => {
                    onLoginSuccess(data);
                    onClose();
                }, 300);
            } else {
                setErrors({ general: data.error || data.message || 'Error en el proceso' });
            }
        } catch (err) {
            console.error('Error completo:', err);
            
            // Manejar diferentes tipos de errores
            if (err.name === 'TypeError' && err.message.includes('fetch')) {
                setErrors({ general: 'Error de conexión. Verifica que el servidor esté funcionando.' });
            } else if (err.message.includes('JSON')) {
                setErrors({ general: 'Error del servidor. La respuesta no es válida.' });
            } else {
                setErrors({ general: err.message || 'Error de conexión. Intenta de nuevo.' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMode = () => {
        setIsRegister(!isRegister);
    };

    // Iconos SVG
    const EyeIcon = ({ isVisible }) => (
        <svg className="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {isVisible ? (
                <>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                </>
            ) : (
                <>
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                </>
            )}
        </svg>
    );

    const CloseIcon = () => (
        <svg className="close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
    );

    const UserIcon = () => (
        <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
        </svg>
    );

    const MailIcon = () => (
        <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
        </svg>
    );

    const LockIcon = () => (
        <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <circle cx="12" cy="16" r="1"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
    );

    return (
        <div className={`modal-overlay ${modalVisible ? 'visible' : ''}`} onClick={handleClose}>
            <div className={`modal-container ${modalVisible ? 'visible' : ''}`} onClick={(e) => e.stopPropagation()}>
                {/* Header del modal */}
                <div className="modal-header">
                    <h2 className="modal-title">
                        {isRegister ? 'Crear Cuenta' : 'Bienvenido de Nuevo'}
                    </h2>
                    <button className="close-btn" onClick={handleClose}>
                        <CloseIcon />
                    </button>
                </div>

                {/* Subtítulo */}
                <p className="modal-subtitle">
                    {isRegister 
                        ? 'Únete a nuestra comunidad y disfruta de beneficios exclusivos'
                        : 'Ingresa a tu cuenta para continuar comprando'
                    }
                </p>

                {/* Toggle entre Login/Registro */}
                <div className="mode-toggle">
                    <button 
                        className={`toggle-btn ${!isRegister ? 'active' : ''}`}
                        onClick={() => setIsRegister(false)}
                        type="button"
                    >
                        Iniciar Sesión
                    </button>
                    <button 
                        className={`toggle-btn ${isRegister ? 'active' : ''}`}
                        onClick={() => setIsRegister(true)}
                        type="button"
                    >
                        Registrarse
                    </button>
                    <div className={`toggle-slider ${isRegister ? 'right' : 'left'}`}></div>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="auth-form">
                    {errors.general && (
                        <div className="error-banner">
                            <div className="error-content">
                                <span className="error-icon">⚠️</span>
                                {errors.general}
                            </div>
                        </div>
                    )}

                    {/* Campo Nombre (solo en registro) */}
                    {isRegister && (
                        <div className="form-group">
                            <div className={`input-wrapper ${errors.nombre ? 'error' : ''}`}>
                                <UserIcon />
                                <input 
                                    type="text" 
                                    name="nombre" 
                                    placeholder="Nombre completo" 
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    className="modern-input"
                                />
                            </div>
                            {errors.nombre && (
                                <span className="error-text">{errors.nombre}</span>
                            )}
                        </div>
                    )}

                    {/* Campo Email */}
                    <div className="form-group">
                        <div className={`input-wrapper ${errors.correo ? 'error' : ''}`}>
                            <MailIcon />
                            <input 
                                type="email" 
                                name="correo" 
                                placeholder="Correo electrónico" 
                                value={formData.correo}
                                onChange={handleChange}
                                className="modern-input"
                            />
                        </div>
                        {errors.correo && (
                            <span className="error-text">{errors.correo}</span>
                        )}
                    </div>

                    {/* Campo Contraseña */}
                    <div className="form-group">
                        <div className={`input-wrapper ${errors.contraseña ? 'error' : ''}`}>
                            <LockIcon />
                            <input 
                                type={showPassword ? "text" : "password"} 
                                name="contraseña" 
                                placeholder="Contraseña" 
                                value={formData.contraseña}
                                onChange={handleChange}
                                className="modern-input"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <EyeIcon isVisible={showPassword} />
                            </button>
                        </div>
                        {errors.contraseña && (
                            <span className="error-text">{errors.contraseña}</span>
                        )}
                    </div>

                    {/* Campo Confirmar Contraseña (solo en registro) */}
                    {isRegister && (
                        <div className="form-group">
                            <div className={`input-wrapper ${errors.confirmarContraseña ? 'error' : ''}`}>
                                <LockIcon />
                                <input 
                                    type={showConfirmPassword ? "text" : "password"} 
                                    name="confirmarContraseña" 
                                    placeholder="Confirmar contraseña" 
                                    value={formData.confirmarContraseña}
                                    onChange={handleChange}
                                    className="modern-input"
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    <EyeIcon isVisible={showConfirmPassword} />
                                </button>
                            </div>
                            {errors.confirmarContraseña && (
                                <span className="error-text">{errors.confirmarContraseña}</span>
                            )}
                        </div>
                    )}

                    {/* Botón de envío */}
                    <button 
                        type="submit" 
                        className={`btn-submit ${isLoading ? 'loading' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="loading-content">
                                <div className="spinner"></div>
                                <span>Procesando...</span>
                            </div>
                        ) : (
                            <>
                                <span>{isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}</span>
                                <div className="btn-shine"></div>
                            </>
                        )}
                    </button>
                </form>

                {/* Links adicionales */}
                <div className="modal-footer">
                    {!isRegister && (
                        <a href="#" className="forgot-link">
                            ¿Olvidaste tu contraseña?
                        </a>
                    )}
                    
                    <div className="terms-text">
                        {isRegister && (
                            <p>
                                Al registrarte, aceptas nuestros{' '}
                                <a href="#" className="link">Términos de Servicio</a>{' '}
                                y{' '}
                                <a href="#" className="link">Política de Privacidad</a>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;