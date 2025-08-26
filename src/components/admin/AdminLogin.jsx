'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
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
  const { login, isAuthenticated, isAdmin } = useAuth();

  // Verificar si el usuario ya está autenticado
  useEffect(() => {
    if (isAuthenticated && isAdmin) {

      window.location.href = '/admin';
    }
  }, [isAuthenticated, isAdmin]);

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

        setAttempts(0);
        // Redirección inmediata después del login exitoso
        window.location.href = '/admin';
      } else {
        setAttempts(prev => prev + 1);
        setError(result.error || 'Error en el login');
        
        // Mostrar advertencia de bloqueo
        if (attempts >= 3) {
          setError(`${result.error} (${5 - attempts} intentos restantes antes del bloqueo)`);
        }
      }

    } catch (error) {
      console.error('❌ Error en login:', error);
      setError('Error de conexión. Verifica tu conexión a internet.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="login-header">
          <div className="logo-section">
            <div className="admin-logo">
              <span className="admin-icon">👨‍💼</span>
            </div>
            <h1>Admin Dashboard</h1>
            <p>Acceso exclusivo para administradores</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className={`error-message ${isLocked ? 'locked' : ''}`}>
              <span className="error-icon">
                {isLocked ? '🔒' : '⚠️'}
              </span>
              {error}
            </div>
          )}

          {isLocked && (
            <div className="lockout-warning">
              <span className="lockout-icon">⏰</span>
              Tiempo restante: {formatTime(lockoutTime)}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <div className="input-container">
              <span className="input-icon">📧</span>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="admin@megatienda.com"
                required
                disabled={loading || isLocked}
                className="form-input"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="input-container">
              <span className="input-icon">🔒</span>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                required
                disabled={loading || isLocked}
                className="form-input"
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

          <button
            type="submit"
            disabled={loading || isLocked}
            className={`login-button ${isLocked ? 'locked' : ''}`}
          >
            {loading ? (
              <NewHamsterLoader size="small" message="Iniciando sesión..." />
            ) : isLocked ? (
              <>
                <span className="button-icon">🔒</span>
                Cuenta Bloqueada
              </>
            ) : (
              <>
                <span className="button-icon">🚀</span>
                Iniciar Sesión
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};

export default AdminLogin;
