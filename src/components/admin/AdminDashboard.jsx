'use client';

import { useEffect, useState } from 'react';
import { getSales, getKpis } from '@/services/salesService';
import KPICard from './KPICard';
import SalesTable from './SalesTable';
import DashboardHeader from './DashboardHeader';
import ProductForm from './ProductForm';
import ProductList from './ProductList';
import '@/styles/AdminDashboard.css';

export default function AdminDashboard() {
  const [sales, setSales] = useState([]);
  const [kpis, setKpis] = useState({});
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showProductForm, setShowProductForm] = useState(false);

  const fetchData = async () => {
    const salesData = await getSales(startDate, endDate);
    setSales(salesData);

    const kpisData = await getKpis();
    setKpis(kpisData);
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const handleDateChange = (type, value) => {
    if (type === 'start') setStartDate(value);
    if (type === 'end') setEndDate(value);
  };

  return (
    <div className="admin-dashboard">
      <h1>Panel de Administración</h1>
      <DashboardHeader
        startDate={startDate}
        endDate={endDate}
        onDateChange={handleDateChange}
        onAddProduct={() => setShowProductForm(!showProductForm)}
      />
      <div className="kpi-container">
        <KPICard title="Total Ventas" value={`$${kpis.totalVentas?.toFixed(2) || 0}`} />
        <KPICard title="Total Pedidos" value={kpis.totalPedidos || 0} />
        <KPICard title="Total Clientes" value={kpis.totalClientes || 0} />
      </div>
      {showProductForm && <ProductForm />}
      <ProductList />
      <SalesTable sales={sales} />
    </div>
  );
}
