'use client';

import React from 'react';
import '../../styles/KPICard.css';

const KPICard = ({ title, value }) => {
    return (
        <div className="kpi-card">
            <h3>{title}</h3>
            <p>{value}</p>
        </div>
    );
};

export default KPICard;
