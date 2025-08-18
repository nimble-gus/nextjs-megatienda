// Servicio de Redis con Upstash para caché distribuido
import { Redis } from '@upstash/redis';

// Configuración de Redis con fallback
let redis = null;

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    console.log('✅ Redis configurado correctamente');
  } else {
    console.log('⚠️ Redis no configurado, usando fallback');
  }
} catch (error) {
  console.log('⚠️ Error configurando Redis, usando fallback:', error.message);
}

// Configuración de TTL (Time To Live) en segundos
const TTL_CONFIG = {
  PRODUCTS: 120, // 2 minutos
  FILTERS: 600,  // 10 minutos
  CATEGORIES: 900, // 15 minutos
  COLORS: 900,   // 15 minutos
  HERO_IMAGES: 1800, // 30 minutos
  PROMO_BANNERS: 1800, // 30 minutos
};

// Función helper para generar claves de caché
const generateCacheKey = (type, params = {}) => {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${params[key]}`)
    .join('|');
  return `megatienda:${type}:${sortedParams}`;
};

// Función helper para serializar/deserializar datos
const serialize = (data) => JSON.stringify(data);
const deserialize = (data) => {
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

// Clase para manejar el caché de productos
export class ProductCache {
  static async get(filters) {
    try {
      if (!redis) return null;
      const key = generateCacheKey('products', filters);
      const cached = await redis.get(key);
      return cached ? deserialize(cached) : null;
    } catch (error) {
      console.error('❌ Error obteniendo caché de productos:', error);
      return null;
    }
  }

  static async set(filters, data) {
    try {
      if (!redis) return;
      const key = generateCacheKey('products', filters);
      await redis.setex(key, TTL_CONFIG.PRODUCTS, serialize(data));
      console.log('✅ Productos almacenados en Redis');
    } catch (error) {
      console.error('❌ Error almacenando caché de productos:', error);
    }
  }

  static async invalidate() {
    try {
      const keys = await redis.keys('megatienda:products:*');
      if (keys.length > 0) {
        await redis.del(...keys);
        console.log('🔄 Caché de productos invalidado en Redis');
      }
    } catch (error) {
      console.error('❌ Error invalidando caché de productos:', error);
    }
  }
}

// Clase para manejar el caché de filtros
export class FilterCache {
  static async get() {
    try {
      if (!redis) return null;
      const key = 'megatienda:filters:all';
      const cached = await redis.get(key);
      return cached ? deserialize(cached) : null;
    } catch (error) {
      console.error('❌ Error obteniendo caché de filtros:', error);
      return null;
    }
  }

  static async set(data) {
    try {
      if (!redis) return;
      const key = 'megatienda:filters:all';
      await redis.setex(key, TTL_CONFIG.FILTERS, serialize(data));
      console.log('✅ Filtros almacenados en Redis');
    } catch (error) {
      console.error('❌ Error almacenando caché de filtros:', error);
    }
  }

  static async invalidate() {
    try {
      if (!redis) return;
      const keys = await redis.keys('megatienda:filters:*');
      if (keys.length > 0) {
        await redis.del(...keys);
        console.log('🔄 Caché de filtros invalidado en Redis');
      }
    } catch (error) {
      console.error('❌ Error invalidando caché de filtros:', error);
    }
  }
}

// Clase para manejar el caché de categorías
export class CategoryCache {
  static async get() {
    try {
      if (!redis) return null;
      const key = 'megatienda:categories:all';
      const cached = await redis.get(key);
      return cached ? deserialize(cached) : null;
    } catch (error) {
      console.error('❌ Error obteniendo caché de categorías:', error);
      return null;
    }
  }

  static async set(data) {
    try {
      if (!redis) return;
      const key = 'megatienda:categories:all';
      await redis.setex(key, TTL_CONFIG.CATEGORIES, serialize(data));
      console.log('✅ Categorías almacenadas en Redis');
    } catch (error) {
      console.error('❌ Error almacenando caché de categorías:', error);
    }
  }

  static async invalidate() {
    try {
      if (!redis) return;
      const keys = await redis.keys('megatienda:categories:*');
      if (keys.length > 0) {
        await redis.del(...keys);
        console.log('🔄 Caché de categorías invalidado en Redis');
      }
    } catch (error) {
      console.error('❌ Error invalidando caché de categorías:', error);
    }
  }
}

// Clase para manejar el caché de colores
export class ColorCache {
  static async get() {
    try {
      if (!redis) return null;
      const key = 'megatienda:colors:all';
      const cached = await redis.get(key);
      return cached ? deserialize(cached) : null;
    } catch (error) {
      console.error('❌ Error obteniendo caché de colores:', error);
      return null;
    }
  }

  static async set(data) {
    try {
      if (!redis) return;
      const key = 'megatienda:colors:all';
      await redis.setex(key, TTL_CONFIG.COLORS, serialize(data));
      console.log('✅ Colores almacenados en Redis');
    } catch (error) {
      console.error('❌ Error almacenando caché de colores:', error);
    }
  }

  static async invalidate() {
    try {
      if (!redis) return;
      const keys = await redis.keys('megatienda:colors:*');
      if (keys.length > 0) {
        await redis.del(...keys);
        console.log('🔄 Caché de colores invalidado en Redis');
      }
    } catch (error) {
      console.error('❌ Error invalidando caché de colores:', error);
    }
  }
}

// Clase para manejar el caché de imágenes multimedia
export class MultimediaCache {
  static async getHeroImages() {
    try {
      if (!redis) return null;
      const key = 'megatienda:hero:images';
      const cached = await redis.get(key);
      return cached ? deserialize(cached) : null;
    } catch (error) {
      console.error('❌ Error obteniendo caché de hero images:', error);
      return null;
    }
  }

  static async setHeroImages(data) {
    try {
      if (!redis) return;
      const key = 'megatienda:hero:images';
      await redis.setex(key, TTL_CONFIG.HERO_IMAGES, serialize(data));
      console.log('✅ Hero images almacenadas en Redis');
    } catch (error) {
      console.error('❌ Error almacenando caché de hero images:', error);
    }
  }

  static async getPromoBanners() {
    try {
      if (!redis) return null;
      const key = 'megatienda:promo:banners';
      const cached = await redis.get(key);
      return cached ? deserialize(cached) : null;
    } catch (error) {
      console.error('❌ Error obteniendo caché de promo banners:', error);
      return null;
    }
  }

  static async setPromoBanners(data) {
    try {
      if (!redis) return;
      const key = 'megatienda:promo:banners';
      await redis.setex(key, TTL_CONFIG.PROMO_BANNERS, serialize(data));
      console.log('✅ Promo banners almacenados en Redis');
    } catch (error) {
      console.error('❌ Error almacenando caché de promo banners:', error);
    }
  }

  static async invalidate() {
    try {
      if (!redis) return;
      const keys = await redis.keys('megatienda:hero:*');
      const promoKeys = await redis.keys('megatienda:promo:*');
      const allKeys = [...keys, ...promoKeys];
      if (allKeys.length > 0) {
        await redis.del(...allKeys);
        console.log('🔄 Caché multimedia invalidado en Redis');
      }
    } catch (error) {
      console.error('❌ Error invalidando caché multimedia:', error);
    }
  }
}

// Funciones helper para invalidación masiva
export const invalidateProductRelatedCache = async () => {
  await Promise.all([
    ProductCache.invalidate(),
    FilterCache.invalidate()
  ]);
  console.log('🔄 Caché relacionado con productos invalidado');
};

export const invalidateFilterCache = async () => {
  await Promise.all([
    FilterCache.invalidate(),
    CategoryCache.invalidate(),
    ColorCache.invalidate()
  ]);
  console.log('🔄 Caché de filtros invalidado');
};

export const invalidateAllCache = async () => {
  try {
    if (!redis) return;
    const keys = await redis.keys('megatienda:*');
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log('🔄 Todo el caché invalidado en Redis');
    }
  } catch (error) {
    console.error('❌ Error invalidando todo el caché:', error);
  }
};

// Función para obtener estadísticas del caché
export const getCacheStats = async () => {
  try {
    if (!redis) return null;
    const keys = await redis.keys('megatienda:*');
    const stats = {
      totalKeys: keys.length,
      products: keys.filter(k => k.includes('products')).length,
      filters: keys.filter(k => k.includes('filters')).length,
      categories: keys.filter(k => k.includes('categories')).length,
      colors: keys.filter(k => k.includes('colors')).length,
      multimedia: keys.filter(k => k.includes('hero') || k.includes('promo')).length,
    };
    return stats;
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas del caché:', error);
    return null;
  }
};

// Exportar la instancia de Redis para uso directo si es necesario
export { redis };
