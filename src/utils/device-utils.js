/**
 * Utilidades para identificación única de dispositivos
 */

// Generar un ID único del dispositivo basado en características del navegador
export const generateDeviceId = () => {
  if (typeof window === 'undefined') {
    return 'server-side';
  }

  try {
    // Combinar múltiples características para crear un ID único
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint', 2, 2);
    
    const canvasFingerprint = canvas.toDataURL();
    
    // Obtener características del navegador
    const screenInfo = `${screen.width}x${screen.height}x${screen.colorDepth}`;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const language = navigator.language;
    const platform = navigator.platform;
    const hardwareConcurrency = navigator.hardwareConcurrency || 'unknown';
    
    // Crear hash simple combinando características
    const combined = `${canvasFingerprint}|${screenInfo}|${timezone}|${language}|${platform}|${hardwareConcurrency}`;
    
    // Hash simple (en producción usar crypto.subtle.digest)
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir a 32-bit integer
    }
    
    return `device_${Math.abs(hash)}_${Date.now()}`;
  } catch (error) {
    // Fallback: usar timestamp + random
    return `device_fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
};

// Obtener información del dispositivo
export const getDeviceInfo = () => {
  if (typeof window === 'undefined') {
    return {
      userAgent: 'server-side',
      platform: 'unknown',
      language: 'unknown',
      screenResolution: 'unknown',
      timezone: 'unknown'
    };
  }

  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    hardwareConcurrency: navigator.hardwareConcurrency || 'unknown'
  };
};

// Generar un token de sesión único
export const generateSessionToken = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const deviceId = generateDeviceId();
  
  return `session_${timestamp}_${random}_${deviceId}`;
};

// Verificar si el dispositivo es el mismo
export const isSameDevice = (storedDeviceId, currentDeviceId) => {
  if (!storedDeviceId || !currentDeviceId) return false;
  
  // Extraer la parte del device ID (antes del timestamp)
  const storedDevice = storedDeviceId.split('_').slice(-1)[0];
  const currentDevice = currentDeviceId.split('_').slice(-1)[0];
  
  return storedDevice === currentDevice;
};
