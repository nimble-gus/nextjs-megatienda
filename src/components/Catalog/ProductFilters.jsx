'use client';
import React, { useState, useEffect } from 'react';
import { getCatalogFilters } from '@/services/catalogService';
import '@/styles/ProductFilters.css';

const ProductFilters = ({ filters, onFilterChange }) => {
  const [priceRange, setPriceRange] = useState(filters.priceRange);
  const [selectedCategories, setSelectedCategories] = useState(filters.categories);
  const [selectedColors, setSelectedColors] = useState(filters.colors);
  const [categories, setCategories] = useState([]);
  const [colors, setColors] = useState([]);
  const [priceRangeData, setPriceRangeData] = useState({ min: 0, max: 1000 });
  const [loading, setLoading] = useState(true);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const [colorsExpanded, setColorsExpanded] = useState(false);
  const [priceFiltering, setPriceFiltering] = useState(false);
  const [categoryFiltering, setCategoryFiltering] = useState(false);
  const [colorFiltering, setColorFiltering] = useState(false);
  const [priceDebounceTimer, setPriceDebounceTimer] = useState(null);
  const [colorDebounceTimer, setColorDebounceTimer] = useState(null);
  const [categoryDebounceTimer, setCategoryDebounceTimer] = useState(null);

  // Sincronizar estado local con props
  useEffect(() => {
    setPriceRange(filters.priceRange);
    setSelectedCategories(filters.categories);
    setSelectedColors(filters.colors);
  }, [filters]);

  // Cargar filtros desde la base de datos
  useEffect(() => {
    let isMounted = true;
    
    const loadFilters = async () => {
      try {
        setLoading(true);
        const filtersData = await getCatalogFilters();
        
        if (!isMounted) return;
        
        setCategories(filtersData.categories);
        setColors(filtersData.colors);
        setPriceRangeData(filtersData.priceRange);
        
        // Solo actualizar el rango de precio si no se ha establecido desde el componente padre
        if (filters.priceRange[0] === 0 && filters.priceRange[1] === 1000) {
          const newRange = [filtersData.priceRange.min, filtersData.priceRange.max];
          setPriceRange(newRange);
          onFilterChange({
            ...filters,
            priceRange: newRange
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error cargando filtros:', error);
        if (isMounted) {
          setLoading(false);
          // Establecer datos por defecto en caso de error
          setCategories([]);
          setColors([]);
          setPriceRangeData({ min: 0, max: 1000 });
        }
      }
    };

    loadFilters();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Cleanup de timers cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (priceDebounceTimer) clearTimeout(priceDebounceTimer);
      if (colorDebounceTimer) clearTimeout(colorDebounceTimer);
      if (categoryDebounceTimer) clearTimeout(categoryDebounceTimer);
    };
  }, [priceDebounceTimer, colorDebounceTimer, categoryDebounceTimer]);

  const handlePriceChange = (newRange) => {
    setPriceRange(newRange);
    onFilterChange({
      ...filters,
      priceRange: newRange
    });
  };

  const handleMinPriceChange = (value) => {
    const newMin = parseInt(value);
    if (newMin <= priceRange[1]) {
      handlePriceChange([newMin, priceRange[1]]);
    }
  };

  const handleMaxPriceChange = (value) => {
    const newMax = parseInt(value);
    if (newMax >= priceRange[0]) {
      handlePriceChange([priceRange[0], newMax]);
    }
  };





  // Función para manejar el cambio de rango completo con debounce
  const handleRangeChange = (type, value) => {
    const numValue = parseInt(value) || 0;
    
    // Limpiar el timer anterior
    if (priceDebounceTimer) {
      clearTimeout(priceDebounceTimer);
    }
    
    let newRange;
    if (type === 'min') {
      // Asegurar que el valor mínimo no sea mayor que el máximo
      const newMin = Math.min(numValue, priceRange[1]);
      const newMax = Math.max(newMin, priceRange[1]);
      newRange = [newMin, newMax];
    } else if (type === 'max') {
      // Asegurar que el valor máximo no sea menor que el mínimo
      const newMax = Math.max(numValue, priceRange[0]);
      const newMin = Math.min(priceRange[0], newMax);
      newRange = [newMin, newMax];
    }
    
    // Actualizar el estado visual inmediatamente
    setPriceRange(newRange);
    
    // Aplicar el filtro después de 2000ms de inactividad (más tiempo para evitar saturación)
    const timer = setTimeout(() => {
      setPriceFiltering(true);
      onFilterChange({
        ...filters,
        priceRange: newRange
      });
      // Resetear el estado de filtrado después de un momento
      setTimeout(() => setPriceFiltering(false), 1000);
    }, 2000); // Debounce de 2000ms para evitar saturación del motor de Prisma
    
    setPriceDebounceTimer(timer);
  };

  const handleCategoryChange = (categoryId) => {
    // Limpiar el timer anterior
    if (categoryDebounceTimer) {
      clearTimeout(categoryDebounceTimer);
    }

    const updatedCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId];

    // Actualizar el estado visual inmediatamente
    setSelectedCategories(updatedCategories);

    // Aplicar el filtro después de 1500ms de inactividad (más tiempo para evitar saturación)
    const timer = setTimeout(() => {
      setCategoryFiltering(true);
      onFilterChange({
        ...filters,
        categories: updatedCategories
      });
      // Resetear el estado de filtrado después de un momento
      setTimeout(() => setCategoryFiltering(false), 1000);
    }, 1500); // Debounce de 1500ms para evitar saturación del motor de Prisma

    setCategoryDebounceTimer(timer);
  };

  const handleColorChange = (colorId) => {
    // Limpiar el timer anterior
    if (colorDebounceTimer) {
      clearTimeout(colorDebounceTimer);
    }

    const updatedColors = selectedColors.includes(colorId)
      ? selectedColors.filter(id => id !== colorId)
      : [...selectedColors, colorId];

    // Actualizar el estado visual inmediatamente
    setSelectedColors(updatedColors);

    // Aplicar el filtro después de 2000ms de inactividad (más tiempo para evitar saturación)
    const timer = setTimeout(() => {
      setColorFiltering(true);
      onFilterChange({
        ...filters,
        colors: updatedColors
      });
      // Resetear el estado de filtrado después de un momento
      setTimeout(() => setColorFiltering(false), 1000);
    }, 2000); // Debounce de 2000ms para evitar saturación del motor de Prisma

    setColorDebounceTimer(timer);
  };

  const clearAllFilters = () => {
    setPriceRange([priceRangeData.min, priceRangeData.max]);
    setSelectedCategories([]);
    setSelectedColors([]);
    onFilterChange({
      priceRange: [priceRangeData.min, priceRangeData.max],
      categories: [],
      colors: []
    });
  };

  return (
    <div className="product-filters">
      {/* Header de filtros */}
      <div className="filters-header">
        <h3 className="filters-title">Filtros</h3>
        <button 
          className="clear-filters-btn"
          onClick={clearAllFilters}
        >
          Limpiar todo
        </button>
      </div>

      {/* Filtro de Precio */}
      <div className="filter-section">
        <h4 className="filter-title">Rango de Precio</h4>
        {loading ? (
          <div className="loading-filters">Cargando filtros...</div>
        ) : (
          <div className="price-filter">
                         <div className="price-range-display">
               <span>Q{priceRange[0].toFixed(2)} - Q{priceRange[1].toFixed(2)}</span>
               {priceFiltering && <span className="price-filtering-indicator">Aplicando...</span>}
             </div>
                         <div className="price-slider-container">
               <div className="price-slider-track"></div>
               <div className="price-slider-range" 
                    style={{
                      left: `${((priceRange[0] - priceRangeData.min) / (priceRangeData.max - priceRangeData.min)) * 100}%`,
                      right: `${100 - ((priceRange[1] - priceRangeData.min) / (priceRangeData.max - priceRangeData.min)) * 100}%`
                    }}>
               </div>
               <input
                 type="range"
                 min={priceRangeData.min}
                 max={priceRangeData.max}
                 value={priceRange[0]}
                 onChange={(e) => handleRangeChange('min', e.target.value)}
                 className="price-slider min-price"
               />
               <input
                 type="range"
                 min={priceRangeData.min}
                 max={priceRangeData.max}
                 value={priceRange[1]}
                 onChange={(e) => handleRangeChange('max', e.target.value)}
                 className="price-slider max-price"
               />
             </div>
                         
          </div>
        )}
      </div>

      {/* Filtro de Categorías */}
      <div className="filter-section">
        <div className="filter-header-collapsible" onClick={() => setCategoriesExpanded(!categoriesExpanded)}>
          <h4 className="filter-title">
            Categorías
            {categoryFiltering && <span className="price-filtering-indicator">Aplicando...</span>}
          </h4>
          <span className={`expand-icon ${categoriesExpanded ? 'expanded' : ''}`}>
            {categoriesExpanded ? '−' : '+'}
          </span>
        </div>
        {loading ? (
          <div className="loading-filters">Cargando categorías...</div>
        ) : (
          <div className={`categories-list ${categoriesExpanded ? 'expanded' : ''}`}>
            {categories.slice(0, categoriesExpanded ? categories.length : 3).map((category) => (
              <label key={category.id} className="category-item">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.id)}
                  onChange={() => handleCategoryChange(category.id)}
                  className="category-checkbox"
                />
                <span className="category-name">{category.name}</span>
                <span className="category-count">({category.productCount})</span>
              </label>
            ))}
            {categories.length > 3 && (
              <button 
                className="show-more-btn"
                onClick={() => setCategoriesExpanded(!categoriesExpanded)}
              >
                {categoriesExpanded ? 'Mostrar menos' : `Mostrar ${categories.length - 3} más`}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Filtro de Colores */}
      <div className="filter-section">
        <div className="filter-header-collapsible" onClick={() => setColorsExpanded(!colorsExpanded)}>
          <h4 className="filter-title">
            Filtrar por Color
            {colorFiltering && <span className="price-filtering-indicator">Aplicando...</span>}
          </h4>
          <span className={`expand-icon ${colorsExpanded ? 'expanded' : ''}`}>
            {colorsExpanded ? '−' : '+'}
          </span>
        </div>
        {loading ? (
          <div className="loading-filters">Cargando colores...</div>
        ) : (
          <div className={`colors-list ${colorsExpanded ? 'expanded' : ''}`}>
            {colors.slice(0, colorsExpanded ? colors.length : 4).map((color) => (
              <label key={color.id} className="color-item">
                <input
                  type="checkbox"
                  checked={selectedColors.includes(color.id)}
                  onChange={() => handleColorChange(color.id)}
                  className="color-checkbox"
                />
                <div 
                  className="color-swatch"
                  style={{ backgroundColor: color.hex }}
                ></div>
                <span className="color-name">{color.name}</span>
                <span className="color-count">({color.productCount})</span>
              </label>
            ))}
            {colors.length > 4 && (
              <button 
                className="show-more-btn"
                onClick={() => setColorsExpanded(!colorsExpanded)}
              >
                {colorsExpanded ? 'Mostrar menos' : `Mostrar ${colors.length - 4} más`}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Botón aplicar filtros */}
      <div className="filters-actions">
        <button className="apply-filters-btn">
          Aplicar Filtros
        </button>
      </div>
    </div>
  );
};

export default ProductFilters;
