// Sistema de caché optimizado para la página Home
import { queryQueue } from './query-queue.js';

// Caché en memoria para evitar múltiples llamadas simultáneas
const memoryCache = new Map();
const cacheTimestamps = new Map();

// TTL en milisegundos
const TTL = {
  CATEGORIES: 5 * 60 * 1000, // 5 minutos
  FILTERS: 10 * 60 * 1000,   // 10 minutos
  FEATURED_PRODUCTS: 2 * 60 * 1000, // 2 minutos
  HERO_IMAGES: 30 * 60 * 1000, // 30 minutos
  PROMO_BANNERS: 30 * 60 * 1000, // 30 minutos
};

// Verificar si el caché es válido
const isCacheValid = (key) => {
  const timestamp = cacheTimestamps.get(key);
  if (!timestamp) return false;
  
  const ttl = TTL[key.split(':')[0].toUpperCase()] || TTL.CATEGORIES;
  return Date.now() - timestamp < ttl;
};

// Limpiar caché expirado
const cleanExpiredCache = () => {
  const now = Date.now();
  for (const [key, timestamp] of cacheTimestamps.entries()) {
    const ttl = TTL[key.split(':')[0].toUpperCase()] || TTL.CATEGORIES;
    if (now - timestamp > ttl) {
      memoryCache.delete(key);
      cacheTimestamps.delete(key);
    }
  }
};

// Función helper para hacer fetch con retry
const fetchWithRetry = async (url, options = {}, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        // Agregar timeout para evitar llamadas colgadas
        signal: AbortSignal.timeout(10000), // 10 segundos timeout
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.log(`🔄 Intento ${i + 1}/${maxRetries} falló para ${url}:`, error.message);
      if (i === maxRetries - 1) throw error;
      // Backoff exponencial
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
};

// Clase para manejar el caché de categorías
export class CategoriesCache {
  static async get() {
    const key = 'categories:all';
    
    // Limpiar caché expirado
    cleanExpiredCache();
    
    // Verificar caché en memoria
    if (memoryCache.has(key) && isCacheValid(key)) {
      console.log('📦 Categorías obtenidas del caché en memoria');
      return memoryCache.get(key);
    }
    
    // Si hay una petición en curso, esperar
    if (memoryCache.has(`${key}:loading`)) {
      console.log('⏳ Esperando petición de categorías en curso...');
      return new Promise((resolve) => {
        const checkCache = () => {
          if (memoryCache.has(key) && isCacheValid(key)) {
            resolve(memoryCache.get(key));
          } else {
            setTimeout(checkCache, 100);
          }
        };
        checkCache();
      });
    }
    
    // Marcar como cargando
    memoryCache.set(`${key}:loading`, true);
    
    try {
      console.log('🔄 Cargando categorías desde API...');
      
      const data = await queryQueue.add(async () => {
        return await fetchWithRetry('/api/categories');
      });
      
      const categories = data.categories || [];
      
      // Almacenar en caché
      memoryCache.set(key, categories);
      cacheTimestamps.set(key, Date.now());
      memoryCache.delete(`${key}:loading`);
      
      console.log('✅ Categorías cargadas y almacenadas en caché');
      return categories;
      
    } catch (error) {
      memoryCache.delete(`${key}:loading`);
      console.error('❌ Error cargando categorías:', error);
      throw error;
    }
  }
  
  static invalidate() {
    const keys = Array.from(memoryCache.keys()).filter(key => key.startsWith('categories:'));
    keys.forEach(key => {
      memoryCache.delete(key);
      cacheTimestamps.delete(key);
    });
    console.log('🔄 Caché de categorías invalidado');
  }
}

// Clase para manejar el caché de filtros
export class FiltersCache {
  static async get() {
    const key = 'filters:all';
    
    // Limpiar caché expirado
    cleanExpiredCache();
    
    // Verificar caché en memoria
    if (memoryCache.has(key) && isCacheValid(key)) {
      console.log('📦 Filtros obtenidos del caché en memoria');
      return memoryCache.get(key);
    }
    
    // Si hay una petición en curso, esperar
    if (memoryCache.has(`${key}:loading`)) {
      console.log('⏳ Esperando petición de filtros en curso...');
      return new Promise((resolve) => {
        const checkCache = () => {
          if (memoryCache.has(key) && isCacheValid(key)) {
            resolve(memoryCache.get(key));
          } else {
            setTimeout(checkCache, 100);
          }
        };
        checkCache();
      });
    }
    
    // Marcar como cargando
    memoryCache.set(`${key}:loading`, true);
    
    try {
      console.log('🔄 Cargando filtros desde API...');
      
      const data = await queryQueue.add(async () => {
        return await fetchWithRetry('/api/catalog/filters');
      });
      
      // Almacenar en caché
      memoryCache.set(key, data);
      cacheTimestamps.set(key, Date.now());
      memoryCache.delete(`${key}:loading`);
      
      console.log('✅ Filtros cargados y almacenados en caché');
      return data;
      
    } catch (error) {
      memoryCache.delete(`${key}:loading`);
      console.error('❌ Error cargando filtros:', error);
      throw error;
    }
  }
  
  static invalidate() {
    const keys = Array.from(memoryCache.keys()).filter(key => key.startsWith('filters:'));
    keys.forEach(key => {
      memoryCache.delete(key);
      cacheTimestamps.delete(key);
    });
    console.log('🔄 Caché de filtros invalidado');
  }
}

// Clase para manejar el caché de productos destacados
export class FeaturedProductsCache {
  static async get() {
    const key = 'featured_products:all';
    
    // Limpiar caché expirado
    cleanExpiredCache();
    
    // Verificar caché en memoria
    if (memoryCache.has(key) && isCacheValid(key)) {
      console.log('📦 Productos destacados obtenidos del caché en memoria');
      return memoryCache.get(key);
    }
    
    // Si hay una petición en curso, esperar
    if (memoryCache.has(`${key}:loading`)) {
      console.log('⏳ Esperando petición de productos destacados en curso...');
      return new Promise((resolve) => {
        const checkCache = () => {
          if (memoryCache.has(key) && isCacheValid(key)) {
            resolve(memoryCache.get(key));
          } else {
            setTimeout(checkCache, 100);
          }
        };
        checkCache();
      });
    }
    
    // Marcar como cargando
    memoryCache.set(`${key}:loading`, true);
    
    try {
      console.log('🔄 Cargando productos destacados desde API...');
      
      const data = await queryQueue.add(async () => {
        return await fetchWithRetry('/api/featured-products');
      });
      
      const products = data.products || [];
      
      // Almacenar en caché
      memoryCache.set(key, products);
      cacheTimestamps.set(key, Date.now());
      memoryCache.delete(`${key}:loading`);
      
      console.log('✅ Productos destacados cargados y almacenados en caché');
      return products;
      
    } catch (error) {
      memoryCache.delete(`${key}:loading`);
      console.error('❌ Error cargando productos destacados:', error);
      throw error;
    }
  }
  
  static invalidate() {
    const keys = Array.from(memoryCache.keys()).filter(key => key.startsWith('featured_products:'));
    keys.forEach(key => {
      memoryCache.delete(key);
      cacheTimestamps.delete(key);
    });
    console.log('🔄 Caché de productos destacados invalidado');
  }
}

// Función para precargar todos los datos de la página Home
export const preloadHomeData = async () => {
  try {
    console.log('🚀 Precargando datos de la página Home...');
    
    const promises = [
      CategoriesCache.get().catch(() => []),
      FiltersCache.get().catch(() => ({})),
      FeaturedProductsCache.get().catch(() => [])
    ];
    
    const [categories, filters, featuredProducts] = await Promise.allSettled(promises);
    
    console.log('✅ Datos de Home precargados:', {
      categories: categories.status === 'fulfilled' ? categories.value.length : 0,
      filters: filters.status === 'fulfilled' ? 'loaded' : 'error',
      featuredProducts: featuredProducts.status === 'fulfilled' ? featuredProducts.value.length : 0
    });
    
    return {
      categories: categories.status === 'fulfilled' ? categories.value : [],
      filters: filters.status === 'fulfilled' ? filters.value : {},
      featuredProducts: featuredProducts.status === 'fulfilled' ? featuredProducts.value : []
    };
    
  } catch (error) {
    console.error('❌ Error precargando datos de Home:', error);
    return {
      categories: [],
      filters: {},
      featuredProducts: []
    };
  }
};

// Función para limpiar todo el caché
export const clearAllCache = () => {
  memoryCache.clear();
  cacheTimestamps.clear();
  console.log('🧹 Todo el caché de Home limpiado');
};

// Función para obtener estadísticas del caché
export const getCacheStats = () => {
  return {
    size: memoryCache.size,
    keys: Array.from(memoryCache.keys()),
    timestamps: Object.fromEntries(cacheTimestamps)
  };
};
