'use client';

import { useState, useEffect } from 'react';
import '@/styles/CacheManager.css';

const CacheManager = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Cargar estadísticas del caché
  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/cache/clear', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  // Limpiar caché específico
  const clearCache = async (type) => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/admin/cache/clear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessage(data.message);
        setStats(data.stats);
      } else {
        setMessage('Error al limpiar caché');
      }
    } catch (error) {
      console.error('Error limpiando caché:', error);
      setMessage('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="cache-manager">
      <div className="cache-header">
        <h3>🔄 Gestor de Caché</h3>
        <p>Gestiona el caché de la aplicación para sincronizar datos</p>
      </div>

      {/* Estadísticas del caché */}
      {stats && (
        <div className="cache-stats">
          <h4>📊 Estadísticas del Caché</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Total:</span>
              <span className="stat-value">{stats.total}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Productos:</span>
              <span className="stat-value">{stats.products}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Órdenes:</span>
              <span className="stat-value">{stats.orders}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Filtros:</span>
              <span className="stat-value">{stats.filters}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Categorías:</span>
              <span className="stat-value">{stats.categories}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Ventas:</span>
              <span className="stat-value">{stats.sales}</span>
            </div>
          </div>
        </div>
      )}

      {/* Botones de acción */}
      <div className="cache-actions">
        <h4>🧹 Acciones de Limpieza</h4>
        <div className="action-buttons">
          <button
            onClick={() => clearCache('products')}
            disabled={loading}
            className="btn-clear btn-products"
          >
            🗑️ Limpiar Productos
          </button>
          
          <button
            onClick={() => clearCache('orders')}
            disabled={loading}
            className="btn-clear btn-orders"
          >
            🗑️ Limpiar Órdenes
          </button>
          
          <button
            onClick={() => clearCache('multimedia')}
            disabled={loading}
            className="btn-clear btn-multimedia"
          >
            🗑️ Limpiar Multimedia
          </button>
          
          <button
            onClick={() => clearCache('expired')}
            disabled={loading}
            className="btn-clear btn-expired"
          >
            🧹 Limpiar Expirado
          </button>
          
          <button
            onClick={() => clearCache('all')}
            disabled={loading}
            className="btn-clear btn-all"
          >
            💥 Limpiar Todo
          </button>
        </div>
      </div>

      {/* Mensaje de estado */}
      {message && (
        <div className="cache-message">
          <span>{message}</span>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="cache-loading">
          <div className="loading-spinner"></div>
          <span>Procesando...</span>
        </div>
      )}

      {/* Información */}
      <div className="cache-info">
        <h4>ℹ️ Información</h4>
        <ul>
          <li><strong>Productos:</strong> Limpia caché de productos, filtros y categorías</li>
          <li><strong>Órdenes:</strong> Limpia caché de órdenes, ventas y KPIs</li>
          <li><strong>Multimedia:</strong> Limpia caché de imágenes hero y banners</li>
          <li><strong>Expirado:</strong> Limpia elementos con TTL expirado</li>
          <li><strong>Todo:</strong> Limpia completamente todo el caché</li>
        </ul>
      </div>
    </div>
  );
};

export default CacheManager;
