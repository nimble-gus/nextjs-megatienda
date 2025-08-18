'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Topbar from '@/components/layout/Topbar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductFilters from '@/components/Catalog/ProductFilters';
import ProductGrid from '@/components/Catalog/ProductGrid';
import { getProducts } from '@/services/catalogService';
import '@/styles/CatalogPage.css';

export default function CatalogPage() {
  const searchParams = useSearchParams();
  
  // Obtener parámetros de URL
  const categoryFromUrl = searchParams.get('category');
  const searchFromUrl = searchParams.get('search');
  
  const [filters, setFilters] = useState({
    priceRange: [0, 1000], // Rango temporal, se actualizará desde la API
    categories: categoryFromUrl ? [parseInt(categoryFromUrl)] : [],
    colors: []
  });
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' o 'list'
  const [sortBy, setSortBy] = useState('default');
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [error, setError] = useState(null);
  const [filtersLoaded, setFiltersLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchFromUrl || '');

  // Cargar filtros iniciales (rango de precio, etc.)
  useEffect(() => {
    const loadInitialFilters = async () => {
      try {
        const response = await fetch('/api/catalog/filters');
        if (!response.ok) {
          throw new Error('Error al cargar filtros');
        }
        const filtersData = await response.json();
        
        // Actualizar el rango de precio con los valores reales de la base de datos
        setFilters(prev => ({
          ...prev,
          priceRange: [filtersData.priceRange.min, filtersData.priceRange.max]
        }));
        
        setFiltersLoaded(true);
        console.log('Filtros iniciales cargados:', filtersData);
      } catch (error) {
        console.error('Error cargando filtros iniciales:', error);
        setFiltersLoaded(true); // Continuar sin filtros si hay error
      }
    };

    loadInitialFilters();
  }, []);

  // Actualizar filtros cuando cambien los parámetros de URL
  useEffect(() => {
    if (categoryFromUrl) {
      const categoryId = parseInt(categoryFromUrl);
      setFilters(prev => ({
        ...prev,
        categories: [categoryId]
      }));
      console.log('Category filter applied from URL:', categoryId);
    }
  }, [categoryFromUrl]);

  // Actualizar búsqueda cuando cambie el parámetro de URL
  useEffect(() => {
    if (searchFromUrl) {
      setSearchQuery(searchFromUrl);
      console.log('Search query applied from URL:', searchFromUrl);
    }
  }, [searchFromUrl]);

  // Cargar productos desde la base de datos
  useEffect(() => {
    // Solo cargar productos cuando los filtros estén listos
    if (!filtersLoaded) return;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const apiFilters = {
          page: currentPage,
          limit: itemsPerPage,
          sortBy: sortBy,
          minPrice: filters.priceRange[0],
          maxPrice: filters.priceRange[1],
          colors: filters.colors,
          category: filters.categories.length > 0 ? filters.categories[0] : null,
          search: searchQuery // Agregar el término de búsqueda
        };
        
        console.log('Cargando productos con filtros:', apiFilters);
        const response = await getProducts(apiFilters);
        
        setProducts(response.products);
        setTotalPages(response.pagination.totalPages);
        setTotalProducts(response.pagination.totalProducts);
        setLoading(false);
      } catch (err) {
        console.error('Error cargando productos:', err);
        setError('Error al cargar los productos');
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, itemsPerPage, sortBy, filters, filtersLoaded, searchQuery]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset a la primera página cuando cambian los filtros
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
  };

  const handleItemsPerPageChange = (items) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  // Función para manejar la búsqueda desde el catálogo
  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset a la primera página
  };

  return (
    <div className="catalog-page">
      {/* Header */}
      <div className="sticky-wrapper">
        <Topbar />
        <Header />
      </div>

      {/* Contenido principal */}
      <main className="catalog-main">
        <div className="catalog-container">
          {/* Sidebar de filtros */}
          <ProductFilters 
            filters={filters}
            onFilterChange={handleFilterChange}
          />

          {/* Área de productos */}
          <section className="products-section">
            {/* Mostrar término de búsqueda si existe */}
            {searchQuery && (
              <div className="search-results-header">
                <h2>Resultados de búsqueda para: "{searchQuery}"</h2>
                <p>{totalProducts} producto{totalProducts !== 1 ? 's' : ''} encontrado{totalProducts !== 1 ? 's' : ''}</p>
              </div>
            )}
            
            {error && (
              <div className="error-message">
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>Reintentar</button>
              </div>
            )}
            <ProductGrid 
              products={products}
              loading={loading}
              currentPage={currentPage}
              totalPages={totalPages}
              totalProducts={totalProducts}
              viewMode={viewMode}
              sortBy={sortBy}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onViewModeChange={handleViewModeChange}
              onSortChange={handleSortChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </section>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
