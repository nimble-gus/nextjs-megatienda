// Componente de debug para monitorear el caché de la página Home
'use client';

import React, { useState, useEffect } from 'react';
import { getCacheStats } from '@/lib/home-cache';

const CacheMonitor = () => {
  const [stats, setStats] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Obtener estadísticas de caché
      const cacheResponse = await fetch('/api/cache/invalidate');
      const cacheData = await cacheResponse.json();
      setStats(cacheData.stats);
      
      // Obtener estado del sistema
      const systemResponse = await fetch('/api/system/status');
      const systemData = await systemResponse.json();
      setSystemStatus(systemData.status);
      
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const invalidateCache = async (type) => {
    try {
      setLoading(true);
      const response = await fetch('/api/cache/invalidate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
        console.log(`✅ Caché ${type} invalidado`);
      }
    } catch (error) {
      console.error('Error invalidating cache:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Actualizar cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: '#1f2937',
      color: 'white',
      padding: '16px',
      borderRadius: '8px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 9999,
      maxWidth: '300px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
    }}>
      <h4 style={{ margin: '0 0 8px 0', color: '#10b981' }}>
        🧠 Cache Monitor
      </h4>
      
      {loading && (
        <div style={{ color: '#fbbf24' }}>⏳ Cargando...</div>
      )}
      
      {stats && (
        <div>
          <div style={{ marginBottom: '8px' }}>
            <strong>Cache Size:</strong> {stats.size} items
          </div>
          
          <div style={{ marginBottom: '8px' }}>
            <strong>Cache Keys:</strong>
            <ul style={{ margin: '4px 0', paddingLeft: '16px' }}>
              {stats.keys.map(key => (
                <li key={key} style={{ fontSize: '11px' }}>{key}</li>
              ))}
            </ul>
          </div>
          
          <div style={{ marginBottom: '12px' }}>
            <strong>Cache Timestamps:</strong>
            <div style={{ fontSize: '11px', marginTop: '4px' }}>
              {Object.entries(stats.timestamps).map(([key, timestamp]) => (
                <div key={key}>
                  {key}: {new Date(timestamp).toLocaleTimeString()}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {systemStatus && (
        <div style={{ marginTop: '12px', borderTop: '1px solid #374151', paddingTop: '8px' }}>
          <div style={{ marginBottom: '8px' }}>
            <strong style={{ color: systemStatus.overall.healthy ? '#10b981' : '#ef4444' }}>
              System: {systemStatus.overall.healthy ? '✅ Healthy' : '❌ Issues'}
            </strong>
          </div>
          
          <div style={{ marginBottom: '4px' }}>
            <strong>DB:</strong> 
            <span style={{ color: systemStatus.database.healthy ? '#10b981' : '#ef4444' }}>
              {systemStatus.database.healthy ? '✅' : '❌'} {systemStatus.database.message}
            </span>
          </div>
          
          <div style={{ marginBottom: '4px' }}>
            <strong>Queue:</strong> 
            <span style={{ color: systemStatus.queue.healthy ? '#10b981' : '#f59e0b' }}>
              {systemStatus.queue.healthy ? '✅' : '⚠️'} {systemStatus.queue.activeQueries}/{systemStatus.queue.maxConcurrent}
            </span>
          </div>
          
          <div style={{ marginBottom: '4px' }}>
            <strong>Queue Size:</strong> {systemStatus.queue.queueSize}
          </div>
        </div>
      )}
      
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        <button
          onClick={() => invalidateCache('categories')}
          style={{
            background: '#ef4444',
            color: 'white',
            border: 'none',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '10px',
            cursor: 'pointer'
          }}
        >
          Clear Categories
        </button>
        
        <button
          onClick={() => invalidateCache('filters')}
          style={{
            background: '#f59e0b',
            color: 'white',
            border: 'none',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '10px',
            cursor: 'pointer'
          }}
        >
          Clear Filters
        </button>
        
        <button
          onClick={() => invalidateCache('featured_products')}
          style={{
            background: '#8b5cf6',
            color: 'white',
            border: 'none',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '10px',
            cursor: 'pointer'
          }}
        >
          Clear Featured
        </button>
        
        <button
          onClick={() => invalidateCache('all')}
          style={{
            background: '#dc2626',
            color: 'white',
            border: 'none',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '10px',
            cursor: 'pointer'
          }}
        >
          Clear All
        </button>
      </div>
    </div>
  );
};

export default CacheMonitor;
