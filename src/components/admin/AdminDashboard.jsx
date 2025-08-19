'use client';

import { useEffect, useState } from 'react';
import { getSales, getKpis } from '@/services/salesService';
import KPICard from './KPICard';
import SalesTable from './SalesTable';
import DashboardHeader from './DashboardHeader';
import ProductForm from './ProductForm';
import ProductList from './ProductList';
import ContactMessages from './ContactMessages';
import LowStockAlert from './LowStockAlert';
import MultimediaManager from './MultimediaManager';
import OrdersManager from './OrdersManager';
import '@/styles/AdminDashboard.css';

export default function AdminDashboard() {
  const [sales, setSales] = useState([]);
  const [kpis, setKpis] = useState({});
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showProductForm, setShowProductForm] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [refreshProducts, setRefreshProducts] = useState(0);

  const fetchData = async () => {
    try {
      console.log('🔄 Cargando datos del dashboard...');
      
      const salesData = await getSales(startDate, endDate);
      setSales(salesData);

      const kpisData = await getKpis();
      setKpis(kpisData);
      
      console.log('✅ Datos del dashboard cargados');
    } catch (error) {
      console.error('❌ Error cargando datos del dashboard:', error);
      // Los servicios ya manejan los errores y retornan valores por defecto
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const handleDateChange = (type, value) => {
    if (type === 'start') setStartDate(value);
    if (type === 'end') setEndDate(value);
  };

  const handleProductAdded = () => {
    setRefreshProducts(prev => prev + 1);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="dashboard-content">
            <div className="kpi-container">
              <KPICard 
                title="Total Ventas" 
                value={`$${kpis.totalVentas?.toFixed(2) || 0}`}
                icon="💰"
                trend="+12.5%"
                trendUp={true}
              />
              <KPICard 
                title="Total Pedidos" 
                value={kpis.totalPedidos || 0}
                icon="📦"
                trend="+8.2%"
                trendUp={true}
              />
              <KPICard 
                title="Total Clientes" 
                value={kpis.totalClientes || 0}
                icon="👥"
                trend="+15.3%"
                trendUp={true}
              />
              <KPICard 
                title="Mensajes Nuevos" 
                value={kpis.mensajesNuevos || 0}
                icon="💬"
                trend="+5.7%"
                trendUp={false}
              />
            </div>
            <div className="dashboard-grid">
              <div className="dashboard-card">
                <h3>Ventas Recientes</h3>
                <SalesTable sales={sales} />
              </div>
              <div className="dashboard-card">
                <LowStockAlert />
              </div>
            </div>
          </div>
        );
      case 'products':
        return (
          <div className={`products-content ${showProductForm ? 'with-form' : ''}`}>
            <div className="content-header">
              <h2>Gestión de Productos</h2>
              <button 
                className="btn-primary"
                onClick={() => setShowProductForm(!showProductForm)}
              >
                {showProductForm ? 'Cancelar' : '+ Agregar Producto'}
              </button>
            </div>
            {showProductForm && <ProductForm onProductAdded={handleProductAdded} />}
            <ProductList key={refreshProducts} />
          </div>
        );
      case 'messages':
        return (
          <div className="messages-content">
            <div className="content-header">
              <h2>Mensajes de Contacto</h2>
            </div>
            <ContactMessages />
          </div>
        );
      case 'sales':
        return (
          <div className="sales-content">
            <div className="content-header">
              <h2>Reportes de Ventas</h2>
              <DashboardHeader
                startDate={startDate}
                endDate={endDate}
                onDateChange={handleDateChange}
              />
            </div>
            <SalesTable sales={sales} />
          </div>
        );
      case 'multimedia':
        return <MultimediaManager />;
      case 'orders':
        return <OrdersManager />;
      default:
        return <div>Sección no encontrada</div>;
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <span className="nav-icon">📊</span>
            <span className="nav-text">Dashboard</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <span className="nav-icon">📦</span>
            <span className="nav-text">Productos</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            <span className="nav-icon">💬</span>
            <span className="nav-text">Mensajes</span>
            {kpis.mensajesNuevos > 0 && (
              <span className="badge">{kpis.mensajesNuevos}</span>
            )}
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'sales' ? 'active' : ''}`}
            onClick={() => setActiveTab('sales')}
          >
            <span className="nav-icon">💰</span>
            <span className="nav-text">Ventas</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'multimedia' ? 'active' : ''}`}
            onClick={() => setActiveTab('multimedia')}
          >
            <span className="nav-icon">🖼️</span>
            <span className="nav-text">Multimedia</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <span className="nav-icon">📦</span>
            <span className="nav-text">Pedidos</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`admin-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <header className="admin-header">
          <div className="header-content">
            <h1>{getPageTitle(activeTab)}</h1>
            <div className="header-actions">
              <button className="btn-secondary">
                <span>🔔</span>
              </button>
              <button className="btn-secondary">
                <span>👤</span>
              </button>
            </div>
          </div>
        </header>

        <div className="admin-content">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

function getPageTitle(tab) {
  switch (tab) {
    case 'dashboard': return 'Dashboard';
    case 'products': return 'Gestión de Productos';
    case 'messages': return 'Mensajes de Contacto';
    case 'sales': return 'Reportes de Ventas';
    case 'multimedia': return 'Gestión de Multimedia';
    case 'orders': return 'Gestión de Pedidos';
    default: return 'Admin Panel';
  }
}
