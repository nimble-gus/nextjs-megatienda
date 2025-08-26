'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import NewHamsterLoader from '../common/NewHamsterLoader';
import '@/styles/AdminLogin.css';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  
  const router = useRouter();
  const { login, isAuthenticated, isAdmin, isLoading } = useAuth();

  // Verificar si el usuario ya está autenticado como admin
  useEffect(() => {
    if (!isLoading && isAuthenticated && isAdmin()) {
      console.log('🔄 Usuario admin autenticado, redirigiendo...');
      router.push('/admin');
    }
  }, [isLoading, isAuthenticated, isAdmin, router]);

  // Manejar bloqueo por intentos fallidos
  useEffect(() => {
    if (attempts >= 5) {
      setIsLocked(true);
      setLockoutTime(300); // 5 minutos
      
      const timer = setInterval(() => {
        setLockoutTime(prev => {
          if (prev <= 1) {
            setIsLocked(false);
            setAttempts(0);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [attempts]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLocked) {
      setError(`Cuenta bloqueada temporalmente. Intenta de nuevo en ${Math.floor(lockoutTime / 60)}:${(lockoutTime % 60).toString().padStart(2, '0')}`);
      return;
    }

    // Validaciones del lado cliente
    if (!formData.email || !formData.password) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (!validateEmail(formData.email)) {
      setError('Por favor ingresa un correo electrónico válido');
      return;
    }

    if (!validatePassword(formData.password)) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const result = await login(formData.email, formData.password);

      if (result.success) {
        console.log('✅ Login exitoso, redirigiendo al admin...');
        setAttempts(0);
        router.push('/admin');
      } else {
        setAttempts(prev => prev + 1);
        setError(result.error || 'Error en el login');
      }
    } catch (error) {
      console.error('❌ Error en login:', error);
      setAttempts(prev => prev + 1);
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const formatLockoutTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Mostrar loading mientras verifica autenticación
  if (isLoading) {
    return (
      <div className="admin-login-loading">
        <div className="loading-content">
          <NewHamsterLoader size="medium" message="Verificando autenticación..." />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        {/* Header */}
        <div className="login-header">
          <div className="admin-icon">
            <span>👨‍💼</span>
          </div>
          <h1 className="login-title">Admin Dashboard</h1>
          <p className="login-subtitle">Acceso exclusivo para administradores</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="login-form">
          {/* Campo Email */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Correo Electrónico
            </label>
            <div className="input-container">
              <span className="input-icon">📧</span>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="admin@megatienda.com"
                className="form-input"
                disabled={loading || isLocked}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Campo Password */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Contraseña
            </label>
            <div className="input-container">
              <span className="input-icon">🔒</span>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="form-input"
                disabled={loading || isLocked}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="password-toggle"
                disabled={loading || isLocked}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Mensaje de Error */}
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Bloqueo por intentos */}
          {isLocked && (
            <div className="lockout-message">
              <span className="lockout-icon">🔒</span>
              <span>Cuenta bloqueada por múltiples intentos fallidos</span>
              <span className="lockout-timer">
                Tiempo restante: {formatLockoutTime(lockoutTime)}
              </span>
            </div>
          )}

          {/* Botón de Login */}
          <button
            type="submit"
            className={`login-button ${loading || isLocked ? 'disabled' : ''}`}
            disabled={loading || isLocked}
          >
            {loading ? (
              <>
                <NewHamsterLoader size="small" />
                <span>Iniciando sesión...</span>
              </>
            ) : (
              <>
                <span>🚀</span>
                <span>Iniciar Sesión</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="login-footer">
          <p className="footer-text">
            Solo personal autorizado puede acceder al panel de administración
          </p>
          <div className="security-info">
            <span className="security-icon">🔐</span>
            <span>Conexión segura</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
