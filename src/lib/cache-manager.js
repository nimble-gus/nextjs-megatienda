// src/lib/cache-manager.js
import { redis } from './redis.js';

// Configuración de patrones de caché
const CACHE_PATTERNS = {
  PRODUCTS: 'megatienda:products:*',
  FILTERS: 'megatienda:filters:*',
  CATEGORIES: 'megatienda:categories:*',
  COLORS: 'megatienda:colors:*',
  HERO_IMAGES: 'megatienda:hero:*',
  PROMO_BANNERS: 'megatienda:promo:*',
  SALES: 'megatienda:sales:*',
  KPIS: 'megatienda:kpis:*',
  ORDERS: 'megatienda:orders:*',
  CART: 'megatienda:cart:*',
  FEATURED_PRODUCTS: 'megatienda:featured:*',
  ALL: 'megatienda:*'
};

// Clase para gestionar el caché de manera centralizada
export class CacheManager {
  // Invalidar caché específico por patrón
  static async invalidatePattern(pattern) {
    try {
      if (!redis) {

        return;
      }
      
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);

      } else {

      }
    } catch (error) {
      console.error(`❌ Error invalidando caché con patrón ${pattern}:`, error);
    }
  }

  // Invalidar múltiples patrones
  static async invalidatePatterns(patterns) {
    await Promise.all(patterns.map(pattern => this.invalidatePattern(pattern)));
  }

  // Invalidar caché relacionado con productos
  static async invalidateProductCache() {
    const patterns = [
      CACHE_PATTERNS.PRODUCTS,
      CACHE_PATTERNS.FILTERS,
      CACHE_PATTERNS.CATEGORIES,
      CACHE_PATTERNS.FEATURED_PRODUCTS
    ];
    await this.invalidatePatterns(patterns);
    
  }

  // Invalidar caché relacionado con órdenes
  static async invalidateOrderCache() {
    const patterns = [
      CACHE_PATTERNS.ORDERS,
      CACHE_PATTERNS.SALES,
      CACHE_PATTERNS.KPIS
    ];
    await this.invalidatePatterns(patterns);
    
  }

  // Invalidar caché relacionado con multimedia
  static async invalidateMultimediaCache() {
    const patterns = [
      CACHE_PATTERNS.HERO_IMAGES,
      CACHE_PATTERNS.PROMO_BANNERS
    ];
    await this.invalidatePatterns(patterns);
    
  }

  // Invalidar caché del carrito para un usuario específico
  static async invalidateCartCache(userId) {
    try {
      if (!redis) {

        return;
      }
      
      const cartKey = `megatienda:cart:${userId}`;
      await redis.del(cartKey);
      
    } catch (error) {
      console.error(`❌ Error invalidando caché del carrito para usuario ${userId}:`, error);
    }
  }

  // Invalidar todo el caché
  static async invalidateAllCache() {
    await this.invalidatePattern(CACHE_PATTERNS.ALL);
    
  }

  // Invalidar caché específico por clave
  static async invalidateKey(key) {
    try {
      if (!redis) return;
      await redis.del(key);
      
    } catch (error) {
      console.error(`❌ Error invalidando clave ${key}:`, error);
    }
  }

  // Invalidar múltiples claves
  static async invalidateKeys(keys) {
    try {
      if (!redis) return;
      await redis.del(...keys);
      
    } catch (error) {
      console.error('❌ Error invalidando claves:', error);
    }
  }

  // Obtener estadísticas del caché
  static async getCacheStats() {
    try {
      if (!redis) return null;
      
      const allKeys = await redis.keys(CACHE_PATTERNS.ALL);
      const stats = {
        total: allKeys.length,
        products: (await redis.keys(CACHE_PATTERNS.PRODUCTS)).length,
        filters: (await redis.keys(CACHE_PATTERNS.FILTERS)).length,
        categories: (await redis.keys(CACHE_PATTERNS.CATEGORIES)).length,
        colors: (await redis.keys(CACHE_PATTERNS.COLORS)).length,
        hero: (await redis.keys(CACHE_PATTERNS.HERO_IMAGES)).length,
        promo: (await redis.keys(CACHE_PATTERNS.PROMO_BANNERS)).length,
        sales: (await redis.keys(CACHE_PATTERNS.SALES)).length,
        kpis: (await redis.keys(CACHE_PATTERNS.KPIS)).length,
        orders: (await redis.keys(CACHE_PATTERNS.ORDERS)).length,
        cart: (await redis.keys(CACHE_PATTERNS.CART)).length,
        featured: (await redis.keys(CACHE_PATTERNS.FEATURED_PRODUCTS)).length
      };
      
      return stats;
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas del caché:', error);
      return null;
    }
  }

  // Limpiar caché expirado (TTL)
  static async cleanupExpiredCache() {
    try {
      if (!redis) return;
      
      const allKeys = await redis.keys(CACHE_PATTERNS.ALL);
      let expiredCount = 0;
      
      for (const key of allKeys) {
        const ttl = await redis.ttl(key);
        if (ttl === -1) { // Sin TTL
          await redis.expire(key, 3600); // Establecer TTL de 1 hora
          expiredCount++;
        }
      }
      
      if (expiredCount > 0) {

      }
    } catch (error) {
      console.error('❌ Error limpiando caché expirado:', error);
    }
  }
}

// Funciones helper para uso directo
export const invalidateProductCache = () => CacheManager.invalidateProductCache();
export const invalidateOrderCache = () => CacheManager.invalidateOrderCache();
export const invalidateMultimediaCache = () => CacheManager.invalidateMultimediaCache();
export const invalidateCartCache = (userId) => CacheManager.invalidateCartCache(userId);
export const invalidateAllCache = () => CacheManager.invalidateAllCache();
export const getCacheStats = () => CacheManager.getCacheStats();
export const cleanupExpiredCache = () => CacheManager.cleanupExpiredCache();
