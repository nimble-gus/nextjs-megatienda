'use client';

import { useState, useEffect } from 'react';
import '@/styles/QueueMonitor.css';

const QueueMonitor = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/queue-stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      } else {
        setError('Error cargando estadísticas');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const executeAction = async (action) => {
    try {
      const response = await fetch('/api/admin/queue-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action })
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        fetchStats(); // Actualizar estadísticas
      } else {
        alert('Error ejecutando acción');
      }
    } catch (error) {
      alert('Error de conexión');
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Actualizar cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="queue-monitor-loading">Cargando estadísticas...</div>;
  }

  if (error) {
    return <div className="queue-monitor-error">Error: {error}</div>;
  }

  return (
    <div className="queue-monitor">
      <div className="queue-monitor-header">
        <h2>📊 Monitor de Cola de Pedidos</h2>
        <div className="queue-actions">
          <button 
            onClick={() => executeAction('pause')}
            className="queue-btn pause-btn"
          >
            ⏸️ Pausar
          </button>
          <button 
            onClick={() => executeAction('resume')}
            className="queue-btn resume-btn"
          >
            ▶️ Reanudar
          </button>
          <button 
            onClick={() => {
              if (confirm('¿Estás seguro de que quieres limpiar la cola?')) {
                executeAction('clear');
              }
            }}
            className="queue-btn clear-btn"
          >
            🧹 Limpiar Cola
          </button>
        </div>
      </div>

      <div className="queue-stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.queueLength}</div>
          <div className="stat-label">Pedidos en Cola</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{stats.processingCount}</div>
          <div className="stat-label">Procesándose</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{stats.totalProcessed}</div>
          <div className="stat-label">Total Procesados</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{stats.totalFailed}</div>
          <div className="stat-label">Fallidos</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{Math.round(stats.averageProcessingTime)}ms</div>
          <div className="stat-label">Tiempo Promedio</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">
            {stats.isProcessing ? '🟢 Activo' : '🔴 Pausado'}
          </div>
          <div className="stat-label">Estado</div>
        </div>
      </div>

      <div className="queue-info">
        <div className="info-item">
          <strong>Última actualización:</strong> {new Date(stats.timestamp).toLocaleString()}
        </div>
        <div className="info-item">
          <strong>Tiempo activo:</strong> {Math.round(stats.uptime / 60)} minutos
        </div>
      </div>

      {stats.queueLength > 10 && (
        <div className="queue-warning">
          ⚠️ <strong>Alerta:</strong> La cola tiene {stats.queueLength} pedidos pendientes. 
          Considera aumentar la capacidad de procesamiento.
        </div>
      )}

      {stats.totalFailed > 0 && (
        <div className="queue-error">
          ❌ <strong>Error:</strong> {stats.totalFailed} pedidos han fallado. 
          Revisa los logs del servidor.
        </div>
      )}
    </div>
  );
};

export default QueueMonitor;
