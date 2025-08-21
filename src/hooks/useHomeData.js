// Hook personalizado para manejar datos de la página Home
import { useState, useEffect } from 'react';
import { CategoriesCache, FiltersCache, FeaturedProductsCache } from '@/lib/home-cache';

export const useHomeData = () => {
  const [data, setData] = useState({
    categories: [],
    filters: {},
    featuredProducts: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Cargar todos los datos en paralelo usando el sistema de caché
        const [categories, filters, featuredProducts] = await Promise.allSettled([
          CategoriesCache.get(),
          FiltersCache.get(),
          FeaturedProductsCache.get()
        ]);

        if (!isMounted) return;

        setData({
          categories: categories.status === 'fulfilled' ? categories.value : [],
          filters: filters.status === 'fulfilled' ? filters.value : {},
          featuredProducts: featuredProducts.status === 'fulfilled' ? featuredProducts.value : []
        });

      } catch (error) {
        if (!isMounted) return;
        console.error('Error loading home data:', error);
        setError('Error al cargar los datos de la página');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  return { data, loading, error };
};

// Hook específico para categorías
export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await CategoriesCache.get();
        
        if (!isMounted) return;
        setCategories(data);

      } catch (error) {
        if (!isMounted) return;
        console.error('Error loading categories:', error);
        setError('Error al cargar categorías');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  return { categories, loading, error };
};

// Hook específico para productos destacados
export const useFeaturedProducts = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadFeaturedProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await FeaturedProductsCache.get();
        
        if (!isMounted) return;
        setFeaturedProducts(data);

      } catch (error) {
        if (!isMounted) return;
        console.error('Error loading featured products:', error);
        setError('Error al cargar productos destacados');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadFeaturedProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  return { featuredProducts, loading, error };
};

// Hook específico para filtros
export const useFilters = () => {
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadFilters = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await FiltersCache.get();
        
        if (!isMounted) return;
        setFilters(data);

      } catch (error) {
        if (!isMounted) return;
        console.error('Error loading filters:', error);
        setError('Error al cargar filtros');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadFilters();

    return () => {
      isMounted = false;
    };
  }, []);

  return { filters, loading, error };
};
