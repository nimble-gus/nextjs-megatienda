'use client';

import React from 'react';
import '@/styles/KPICard.css';

const KPICard = ({ title, value, icon, trend, trendUp, error, loading, priority }) => {
  const getPriorityClass = () => {
    if (!priority) return '';
    return `priority-${priority}`;
  };

  const getPriorityIcon = () => {
    if (priority === 'high') return '🔴';
    if (priority === 'medium') return '🟡';
    if (priority === 'low') return '🟢';
    return '';
  };

  return (
    <div className={`kpi-card ${error ? 'error' : ''} ${loading ? 'loading' : ''} ${getPriorityClass()}`}>
      <div className="kpi-header">
        <div className="kpi-icon">{icon}</div>
        <div className="kpi-trend">
          {!error && trend && (
            <span className={`trend-value ${trendUp ? 'up' : 'down'}`}>
              {getPriorityIcon()} {trend}
            </span>
          )}
          {error && (
            <span className="error-indicator">⚠️</span>
          )}
        </div>
      </div>
      <div className="kpi-content">
        <h3 className="kpi-title">{title}</h3>
        {loading ? (
          <p className="kpi-value loading">Cargando...</p>
        ) : error ? (
          <p className="kpi-value error">Error</p>
        ) : (
          <p className="kpi-value">{value}</p>
        )}
      </div>
    </div>
  );
};

export default KPICard;
