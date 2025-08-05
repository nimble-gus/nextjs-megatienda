import React from 'react';
import '../../styles/DashboardHeader.css';

const DashboardHeader = ({ startDate, endDate, onDateChange, onAddProduct }) => {
    return (
        <div className="dashboard-header">
            <div className="date-filters">
                <label>Desde:</label>
                <input type="date" value={startDate} onChange={(e) => onDateChange('start', e.target.value)} />
                <label>Hasta:</label>
                <input type="date" value={endDate} onChange={(e) => onDateChange('end', e.target.value)} />
            </div>
            <button className="add-product-btn" onClick={onAddProduct}>
                + Subir Producto
            </button>
        </div>
    );
};

export default DashboardHeader;
