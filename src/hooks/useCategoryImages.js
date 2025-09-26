import { useState, useEffect } from 'react';

const useCategoryImages = () => {
  const [categoryImages, setCategoryImages] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategoryImages();
  }, []);

  const loadCategoryImages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/category-images');
      const data = await response.json();
      
      if (data.success) {
        setCategoryImages(data.config);
      }
    } catch (error) {
      console.error('Error cargando imágenes de categorías:', error);
    } finally {
      setLoading(false);
    }
  };

  return { categoryImages, loading, refetch: loadCategoryImages };
};

export default useCategoryImages;
