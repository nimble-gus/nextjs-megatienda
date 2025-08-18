'use client';

import React from 'react';
import '@/styles/KPICard.css';

const KPICard = ({ title, value, icon, trend, trendUp }) => {
  return (
    <div className="kpi-card">
      <div className="kpi-header">
        <div className="kpi-icon">{icon}</div>
        <div className="kpi-trend">
          <span className={`trend-value ${trendUp ? 'up' : 'down'}`}>
            {trend}
          </span>
        </div>
      </div>
      <div className="kpi-content">
        <h3 className="kpi-title">{title}</h3>
        <p className="kpi-value">{value}</p>
      </div>
    </div>
  );
};

export default KPICard;
