/**
 * Utilidades para manejo seguro de autenticación de cliente
 * Separado completamente del sistema de admin
 */

// Verificar si el usuario es cliente (no admin)
export const isClientUser = (user) => {
  return user && user.rol === 'cliente';
};

// Verificar si el usuario está autenticado como cliente
export const isClientAuthenticated = (user, isAuthenticated) => {
  return isAuthenticated && isClientUser(user);
};

// Obtener información segura del usuario para mostrar
export const getClientDisplayInfo = (user) => {
  if (!isClientUser(user)) return null;
  
  return {
    id: user.id,
    nombre: user.nombre,
    email: user.correo,
    rol: user.rol,
    // No incluir información sensible
  };
};

// Validar permisos de cliente para acciones específicas
export const validateClientPermission = (user, action) => {
  if (!isClientUser(user)) return false;
  
  const permissions = {
    'view_profile': true,
    'edit_profile': true,
    'view_orders': true,
    'create_order': true,
    'view_cart': true,
    'modify_cart': true,
    // Agregar más permisos según sea necesario
  };
  
  return permissions[action] || false;
};

// Limpiar datos sensibles del usuario antes de enviar al cliente
export const sanitizeClientUserData = (user) => {
  if (!user) return null;
  
  const { password, contraseña, ...sanitizedUser } = user;
  return sanitizedUser;
};

// Generar identificador único de sesión para tracking
export const generateClientSessionId = (userId) => {
  return `client_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Verificar si la sesión del cliente ha expirado
export const isClientSessionExpired = (lastActivity) => {
  if (!lastActivity) return true;
  
  const now = Date.now();
  const lastActivityTime = new Date(lastActivity).getTime();
  const sessionTimeout = 7 * 24 * 60 * 60 * 1000; // 7 días en ms
  
  return (now - lastActivityTime) > sessionTimeout;
};

// Registrar actividad del cliente para auditoría
export const logClientActivity = (userId, action, details = {}) => {
  // En producción, esto se enviaría a un sistema de logging
  console.log(`Client Activity - User: ${userId}, Action: ${action}`, details);
  
  // Aquí podrías implementar logging a base de datos o servicio externo
  // Por ejemplo, usar la tabla account_activity_log existente
};

// Validar datos de entrada del cliente
export const validateClientInput = (data, type) => {
  const validators = {
    email: (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email) && email.length <= 255;
    },
    password: (password) => {
      return password && password.length >= 6 && password.length <= 128;
    },
    nombre: (nombre) => {
      return nombre && nombre.trim().length >= 2 && nombre.trim().length <= 100;
    }
  };
  
  const validator = validators[type];
  return validator ? validator(data) : false;
};

// Prevenir ataques de timing en comparación de tokens
export const safeTokenComparison = (token1, token2) => {
  if (!token1 || !token2) return false;
  
  // Usar comparación segura para evitar timing attacks
  let result = 0;
  const minLength = Math.min(token1.length, token2.length);
  
  for (let i = 0; i < minLength; i++) {
    result |= token1.charCodeAt(i) ^ token2.charCodeAt(i);
  }
  
  result |= token1.length ^ token2.length;
  return result === 0;
};
