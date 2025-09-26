'use client';

import { useState, useEffect } from 'react';
import '@/styles/CategoryImagesManager.css';

const CategoryImagesManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [saving, setSaving] = useState(false);

  // Configuración de categorías con imágenes por defecto
  const defaultCategoryConfig = {
    1: { name: 'Juguetes', currentImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    2: { name: 'Fitness', currentImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    3: { name: 'Herramientas', currentImage: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    4: { name: 'Electrónicos', currentImage: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    5: { name: 'Mascotas', currentImage: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    6: { name: 'Libros', currentImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      
      // Cargar categorías desde la API
      const categoriesResponse = await fetch('/api/categories');
      const categoriesData = await categoriesResponse.json();
      
      // Cargar configuración de imágenes
      const imagesResponse = await fetch('/api/admin/category-images');
      const imagesData = await imagesResponse.json();
      
      if (categoriesData.success && imagesData.success) {
        // Combinar categorías con configuración de imágenes
        const categoriesWithImages = categoriesData.categories.map(category => ({
          ...category,
          currentImage: imagesData.config[category.id]?.imageUrl || defaultCategoryConfig[category.id]?.currentImage || '',
          imageUrl: imagesData.config[category.id]?.imageUrl || defaultCategoryConfig[category.id]?.currentImage || ''
        }));
        setCategories(categoriesWithImages);
      } else {
        // Si no hay API, usar datos de ejemplo
        setCategories(Object.entries(defaultCategoryConfig).map(([id, config]) => ({
          id: parseInt(id),
          nombre: config.name,
          currentImage: config.currentImage,
          imageUrl: config.currentImage
        })));
      }
    } catch (error) {
      console.error('Error cargando categorías:', error);
      // Usar datos de ejemplo en caso de error
      setCategories(Object.entries(defaultCategoryConfig).map(([id, config]) => ({
        id: parseInt(id),
        nombre: config.name,
        currentImage: config.currentImage,
        imageUrl: config.currentImage
      })));
    } finally {
      setLoading(false);
    }
  };

  const handleEditImage = (category) => {
    setEditingCategory(category);
    setNewImageUrl(category.imageUrl || '');
  };

  const handleSaveImage = async () => {
    if (!editingCategory || !newImageUrl.trim()) return;

    try {
      setSaving(true);
      
      // Guardar en el servidor usando la API
      const response = await fetch('/api/admin/category-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categoryId: editingCategory.id,
          imageUrl: newImageUrl
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Actualizar el estado local
        setCategories(prev => prev.map(cat => 
          cat.id === editingCategory.id 
            ? { ...cat, imageUrl: newImageUrl, currentImage: newImageUrl }
            : cat
        ));
        
        setEditingCategory(null);
        setNewImageUrl('');
        
        // Mostrar mensaje de éxito
        alert('Imagen actualizada correctamente');
      } else {
        throw new Error(result.error || 'Error al guardar la imagen');
      }
      
    } catch (error) {
      console.error('Error guardando imagen:', error);
      alert(`Error al guardar la imagen: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setNewImageUrl('');
  };

  const handlePreviewImage = (url) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="category-images-manager">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando categorías...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="category-images-manager">
      <div className="content-header">
        <h2>Gestión de Imágenes de Categorías</h2>
        <p>Administra las imágenes de fondo de las categorías en la página principal</p>
      </div>

      <div className="categories-grid">
        {categories.map((category) => (
          <div key={category.id} className="category-card">
            <div className="category-preview">
              <div 
                className="category-image"
                style={{ backgroundImage: `url(${category.currentImage})` }}
              >
                <div className="image-overlay">
                  <h3>{category.nombre}</h3>
                </div>
              </div>
            </div>
            
            <div className="category-actions">
              <button 
                className="btn-edit"
                onClick={() => handleEditImage(category)}
              >
                ✏️ Editar Imagen
              </button>
              <button 
                className="btn-preview"
                onClick={() => handlePreviewImage(category.currentImage)}
                disabled={!category.currentImage}
              >
                👁️ Vista Previa
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de edición */}
      {editingCategory && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Editar Imagen - {editingCategory.nombre}</h3>
              <button 
                className="modal-close"
                onClick={handleCancelEdit}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="imageUrl">URL de la Imagen:</label>
                <input
                  type="url"
                  id="imageUrl"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className="form-input"
                />
                <small className="form-help">
                  Ingresa la URL de la imagen que quieres usar para esta categoría
                </small>
              </div>
              
              {newImageUrl && (
                <div className="image-preview">
                  <h4>Vista Previa:</h4>
                  <div 
                    className="preview-image"
                    style={{ backgroundImage: `url(${newImageUrl})` }}
                  />
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-cancel"
                onClick={handleCancelEdit}
                disabled={saving}
              >
                Cancelar
              </button>
              <button 
                className="btn-save"
                onClick={handleSaveImage}
                disabled={saving || !newImageUrl.trim()}
              >
                {saving ? 'Guardando...' : 'Guardar Imagen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryImagesManager;
