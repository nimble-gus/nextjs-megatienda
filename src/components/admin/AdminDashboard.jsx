'use client';

import { useEffect, useState } from 'react';
import { getSales, getKpis } from '@/services/salesService';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useAdminOrders } from '@/contexts/AdminOrdersContext';

import KPICard from './KPICard';
import SalesTable from './SalesTable';
import DashboardHeader from './DashboardHeader';
import ProductForm from './ProductForm';
import ProductList from './ProductList';
import ContactMessages from './ContactMessages';
import LowStockAlert from './LowStockAlert';
import MultimediaManager from './MultimediaManager';
import OrdersManager from './OrdersManager';
import CacheManager from './CacheManager';
import OrderNotifications from './OrderNotifications';
import CategoryImagesManager from './CategoryImagesManager';
import '@/styles/AdminDashboard.css';

export default function AdminDashboard() {
  const { adminUser, adminLogout } = useAdminAuth();
  const { pendingOrdersCount } = useAdminOrders();
  const [sales, setSales] = useState([]);
  const [salesSummary, setSalesSummary] = useState({ totalVentas: 0, totalPedidos: 0 });
  const [kpis, setKpis] = useState({});
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showProductForm, setShowProductForm] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshProducts, setRefreshProducts] = useState(0);

  const fetchData = async () => {
    try {

      const salesData = await getSales(startDate, endDate);
      
      // Manejar la nueva estructura de respuesta
      if (salesData.sales && salesData.summary) {
        setSales(salesData.sales);
        setSalesSummary(salesData.summary);
      } else {
        // Compatibilidad con estructura antigua
        setSales(Array.isArray(salesData) ? salesData : []);
        setSalesSummary({ 
          totalVentas: 0, 
          totalPedidos: Array.isArray(salesData) ? salesData.length : 0 
        });
      }

      const kpisData = await getKpis();
      setKpis(kpisData);

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
                value={`Q${kpis.totalVentas?.toFixed(2) || 0}`}
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
            
            {/* KPIs de Estados de Pedidos */}
            <div className="order-status-kpis">
              <h3 className="section-title">Estados de Pedidos</h3>
              <div className="kpi-container order-status-grid">
                <KPICard 
                  title="Pedidos Pendientes" 
                  value={kpis.pedidosPendientes || 0}
                  icon="⏳"
                  trend="Requieren atención"
                  trendUp={false}
                  priority="high"
                />
                <KPICard 
                  title="Contra Entrega - Pendientes de Enviar" 
                  value={kpis.contraEntregaPendientes || 0}
                  icon="🚚"
                  trend="Pendientes de envío"
                  trendUp={false}
                  priority="medium"
                />
                <KPICard 
                  title="Transferencia - Pendientes de Validar" 
                  value={kpis.transferenciaPendientes || 0}
                  icon="🏦"
                  trend="Pendientes de validación"
                  trendUp={false}
                  priority="medium"
                />
              </div>
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
            
            {/* KPI del rango de fechas seleccionado */}
            {(startDate || endDate) && (
              <div className="sales-kpi-section">
                <h3 className="section-title">Resumen del Período Seleccionado</h3>
                <div className="kpi-container sales-range-kpis">
                  <KPICard 
                    title="Total Ventas del Período" 
                    value={`Q${salesSummary.totalVentas?.toFixed(2) || '0.00'}`}
                    icon="💰"
                    trend={`${salesSummary.totalPedidos || 0} pedidos`}
                    trendUp={salesSummary.totalVentas > 0}
                    priority="high"
                  />
                  <KPICard 
                    title="Pedidos del Período" 
                    value={salesSummary.totalPedidos || 0}
                    icon="📦"
                    trend={salesSummary.fechaInicio && salesSummary.fechaFin 
                      ? `${salesSummary.fechaInicio} - ${salesSummary.fechaFin}` 
                      : 'Rango personalizado'}
                    trendUp={salesSummary.totalPedidos > 0}
                    priority="medium"
                  />
                  {salesSummary.totalPedidos > 0 && (
                    <KPICard 
                      title="Promedio por Pedido" 
                      value={`Q${(salesSummary.totalVentas / salesSummary.totalPedidos).toFixed(2)}`}
                      icon="📊"
                      trend="Valor promedio"
                      trendUp={true}
                      priority="low"
                    />
                  )}
                </div>
              </div>
            )}
            
            <SalesTable sales={sales} />
          </div>
        );
      case 'multimedia':
        return <MultimediaManager />;
      case 'orders':
        return <OrdersManager />;
      case 'cache':
        return <CacheManager />;
      case 'category-images':
        return <CategoryImagesManager />;
      default:
        return <div>Sección no encontrada</div>;
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Notificaciones de órdenes */}
      <OrderNotifications />
      
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
            {pendingOrdersCount > 0 && (
              <span className="badge orders-badge">{pendingOrdersCount}</span>
            )}
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'cache' ? 'active' : ''}`}
            onClick={() => setActiveTab('cache')}
          >
            <span className="nav-icon">🔄</span>
            <span className="nav-text">Caché</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'category-images' ? 'active' : ''}`}
            onClick={() => setActiveTab('category-images')}
          >
            <span className="nav-icon">🖼️</span>
            <span className="nav-text">Imágenes Categorías</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`admin-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <header className="admin-header">
          <div className="header-content">
            <h1>{getPageTitle(activeTab)}</h1>
            <div className="header-actions">
              <div className="user-info">
                <span className="user-avatar">👨‍💼</span>
                <div className="user-details">
                                                <span className="user-name">{adminUser?.nombre || 'Admin'}</span>
                <span className="user-role">{adminUser?.rol === 'admin' ? 'Administrador' : 'Usuario'}</span>
                </div>
              </div>
              <button className="btn-secondary" title="Notificaciones">
                <span>🔔</span>
              </button>
                            <button 
                className="btn-logout"
                onClick={adminLogout}
                title="Cerrar sesión"
              >
                <span>🚪</span>
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
    case 'cache': return 'Gestión de Caché';
    case 'category-images': return 'Imágenes de Categorías';
    default: return 'Admin Panel';
  }
}

