'use client';

import { useState, useEffect, useRef } from 'react';
import { getProducts, deleteProduct } from '@/services/productService';
import { getCategories } from '@/services/categoryService';
import { getColors } from '@/services/colorService';
import { uploadImageToCloudinary } from '@/services/cloudinaryService';
import '@/styles/ProductList.css';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showStockForm, setShowStockForm] = useState(false);
  const [showImagesForm, setShowImagesForm] = useState(false);
  const [editingStock, setEditingStock] = useState(null);
  const [editingImages, setEditingImages] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [availableColors, setAvailableColors] = useState([]);
  const [loadingColors, setLoadingColors] = useState(false);
  const [newVariants, setNewVariants] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingMainImage, setUploadingMainImage] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [mainImageDragActive, setMainImageDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const mainImageFileInputRef = useRef(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      // Solo mostrar error si es persistente, no si es temporal
      if (err.message.includes('Error al obtener productos')) {
        setError('Error al cargar los productos');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const categoriesData = await getCategories();
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error fetching categories:', err);
      // Si falla, usar categorías por defecto sin mostrar error al usuario
      setCategories([
        { id: 1, nombre: 'Ropa' },
        { id: 2, nombre: 'Calzado' },
        { id: 3, nombre: 'Accesorios' },
        { id: 4, nombre: 'Electrónica' },
        { id: 5, nombre: 'Hogar' }
      ]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchColors = async () => {
    try {
      setLoadingColors(true);
      const colorsData = await getColors();
      setAvailableColors(colorsData);
    } catch (err) {
      console.error('Error fetching colors:', err);
      // Si falla, usar colores por defecto
      setAvailableColors([
        { id: 1, nombre: 'Negro', codigo_hex: '#000000' },
        { id: 2, nombre: 'Blanco', codigo_hex: '#FFFFFF' },
        { id: 3, nombre: 'Rojo', codigo_hex: '#FF0000' },
        { id: 4, nombre: 'Azul', codigo_hex: '#0000FF' },
        { id: 5, nombre: 'Verde', codigo_hex: '#00FF00' }
      ]);
    } finally {
      setLoadingColors(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowEditForm(true);
  };

  const handleEditStock = async (product) => {
    try {
      // Obtener el stock detallado del producto
      const response = await fetch(`/api/admin/products/${product.id}/stock`);
      if (!response.ok) {
        throw new Error('Error al obtener el stock del producto');
      }
      const stockData = await response.json();
      
      // Cargar colores disponibles
      await fetchColors();
      
      setEditingStock({
        product: product,
        stockItems: stockData
      });
      setNewVariants([]); // Resetear nuevas variantes
      setShowStockForm(true);
    } catch (err) {
      alert('Error al cargar el stock del producto');
      console.error('Error loading stock:', err);
    }
  };

  const handleEditImages = async (product) => {
    try {
      // Obtener las imágenes del producto
      const response = await fetch(`/api/admin/products/${product.id}/images`);
      if (!response.ok) {
        throw new Error('Error al obtener las imágenes del producto');
      }
      const imagesData = await response.json();
      
      setEditingImages({
        product: product,
        images: imagesData
      });
      setShowImagesForm(true);
    } catch (err) {
      alert('Error al cargar las imágenes del producto');
      console.error('Error loading images:', err);
    }
  };

  const handleDelete = async (productId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const result = await deleteProduct(productId);
      
      // Actualizar el estado local inmediatamente
      setProducts(prevProducts => prevProducts.filter(product => product.id !== productId));
      
      // También recargar desde el servidor para asegurar sincronización
      await fetchProducts();
      
      alert('Producto eliminado exitosamente');
    } catch (err) {
      console.error('Error deleting product:', err);
      alert(`Error al eliminar el producto: ${err.message}`);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formData = new FormData(e.target);
      const productData = {
        nombre: formData.get('nombre'),
        descripcion: formData.get('descripcion'),
        categoria: formData.get('categoria'),
        featured: formData.get('featured') === 'on',
        url_imagen: editingProduct.url_imagen || '' // Usar el valor del estado
      };
      const response = await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el producto');
      }

      await fetchProducts(); // Recargar la lista
      setShowEditForm(false);
      setEditingProduct(null);
      alert('Producto actualizado exitosamente');
    } catch (err) {
      alert('Error al actualizar el producto');
      console.error('Error updating product:', err);
    }
  };

  const handleCancelEdit = () => {
    setShowEditForm(false);
    setEditingProduct(null);
  };

  const handleCancelStockEdit = () => {
    setShowStockForm(false);
    setEditingStock(null);
    setNewVariants([]);
  };

  const addNewVariant = () => {
    const newVariant = {
      id: `new_${Date.now()}`,
      colorId: '',
      cantidad: 0,
      precio: 0,
      isNew: true
    };
    setNewVariants([...newVariants, newVariant]);
  };

  const removeNewVariant = (variantId) => {
    setNewVariants(newVariants.filter(variant => variant.id !== variantId));
  };

  const updateNewVariant = (variantId, field, value) => {
    setNewVariants(newVariants.map(variant => 
      variant.id === variantId 
        ? { ...variant, [field]: value }
        : variant
    ));
  };

  const handleCancelImagesEdit = () => {
    setShowImagesForm(false);
    setEditingImages(null);
  };

  const handleStockSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formData = new FormData(e.target);
      const stockUpdates = [];
      const newStockItems = [];
      
      // Recopilar todos los cambios de stock existente
      editingStock.stockItems.forEach(item => {
        const cantidad = parseInt(formData.get(`stock_${item.id}`));
        const precio = parseFloat(formData.get(`precio_${item.id}`));
        
        if (cantidad !== item.cantidad || precio !== item.precio) {
          stockUpdates.push({
            id: item.id,
            cantidad: cantidad,
            precio: precio
          });
        }
      });

      // Recopilar nuevas variantes
      newVariants.forEach(variant => {
        const colorId = parseInt(formData.get(`color_${variant.id}`));
        const cantidad = parseInt(formData.get(`stock_${variant.id}`));
        const precio = parseFloat(formData.get(`precio_${variant.id}`));
        
        if (colorId && cantidad >= 0 && precio >= 0) {
          // Verificar que no exista ya esa variante de color
          const existsColor = editingStock.stockItems.some(item => item.color.id === colorId);
          if (!existsColor) {
            newStockItems.push({
              producto_id: editingStock.product.id,
              color_id: colorId,
              cantidad: cantidad,
              precio: precio
            });
          }
        }
      });

      if (stockUpdates.length === 0 && newStockItems.length === 0) {
        alert('No hay cambios para guardar');
        return;
      }

      const response = await fetch(`/api/admin/products/${editingStock.product.id}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          stockUpdates,
          newStockItems
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar el stock');
      }

      await fetchProducts(); // Recargar la lista
      setShowStockForm(false);
      setEditingStock(null);
      setNewVariants([]);
      alert('Stock actualizado exitosamente');
    } catch (err) {
      alert(`Error al actualizar el stock: ${err.message}`);
      console.error('Error updating stock:', err);
    }
  };

  const handleImagesSubmit = async (e) => {
    e.preventDefault();
    
    // Solo cerrar el modal, las imágenes se guardan automáticamente al subirse
    setShowImagesForm(false);
    setEditingImages(null);
    await fetchProducts(); // Recargar la lista
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleMainImageDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setMainImageDragActive(true);
    } else if (e.type === "dragleave") {
      setMainImageDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleMainImageDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setMainImageDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleMainImageUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = async (e) => {
    if (e.target.files && e.target.files[0]) {
      await handleFileUpload(e.target.files[0]);
    }
  };

  const handleMainImageSelect = async (e) => {
    if (e.target.files && e.target.files[0]) {
      await handleMainImageUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona solo archivos de imagen');
      return;
    }

    setUploadingImage(true);
    try {
      const imageUrl = await uploadImageToCloudinary(file);
      
      // Agregar la imagen al producto
      const response = await fetch(`/api/admin/products/${editingImages.product.id}/images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url_imagen: imageUrl }),
      });

      if (!response.ok) {
        throw new Error('Error al guardar la imagen');
      }

      // Actualizar la lista de imágenes en el estado
      const newImage = await response.json();
      setEditingImages(prev => ({
        ...prev,
        images: [...prev.images, newImage.image]
      }));
      
      alert('Imagen subida exitosamente');
    } catch (err) {
      alert('Error al subir la imagen');
      console.error('Error uploading image:', err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleMainImageUpload = async (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona solo archivos de imagen');
      return;
    }

    setUploadingMainImage(true);
    try {
      const imageUrl = await uploadImageToCloudinary(file);
      
      // Actualizar la URL de la imagen principal en el estado
      setEditingProduct(prev => ({
        ...prev,
        url_imagen: imageUrl
      }));
      
      alert('Imagen principal actualizada exitosamente');
    } catch (err) {
      alert('Error al subir la imagen principal');
      console.error('Error uploading main image:', err);
    } finally {
      setUploadingMainImage(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta imagen?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/products/images/${imageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la imagen');
      }

      // Actualizar la lista de imágenes en el estado
      setEditingImages(prev => ({
        ...prev,
        images: prev.images.filter(img => img.id !== imageId)
      }));
      
      alert('Imagen eliminada exitosamente');
    } catch (err) {
      alert('Error al eliminar la imagen');
      console.error('Error deleting image:', err);
    }
  };

  if (loading) {
    return (
      <div className="product-list-container">
        <div className="product-list-header">
          <h3>Productos Existentes</h3>
          <span className="product-count">Cargando...</span>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-list-container">
        <div className="product-list-header">
          <h3>Productos Existentes</h3>
        </div>
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchProducts}>Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-list-container">
      <div className="product-list-header">
        <h3>Productos Existentes</h3>
        <div className="header-actions">
          <button 
            onClick={fetchProducts} 
            className="refresh-btn"
            title="Refrescar lista de productos"
          >
            🔄 Refrescar
          </button>
          <span className="product-count">{products.length} productos</span>
        </div>
      </div>

      {showEditForm && editingProduct && (
        <div className="edit-form-overlay">
          <div className="edit-form-modal">
            <div className="edit-form-header">
              <h3>Editar Producto</h3>
              <button className="close-btn" onClick={handleCancelEdit}>×</button>
            </div>
            <form onSubmit={handleEditSubmit} className="edit-form">
              <div className="form-group">
                <label htmlFor="nombre">Nombre del Producto *</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  defaultValue={editingProduct.nombre}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="descripcion">Descripción *</label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  defaultValue={editingProduct.descripcion}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="categoria">Categoría *</label>
                <select
                  id="categoria"
                  name="categoria"
                  defaultValue={editingProduct.categoria}
                  required
                  disabled={loadingCategories}
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.nombre}>
                      {category.nombre}
                    </option>
                  ))}
                </select>
                {loadingCategories && (
                  <small style={{ color: '#6b7280', fontStyle: 'italic' }}>
                    Cargando categorías...
                  </small>
                )}
              </div>
              
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="featured"
                    defaultChecked={editingProduct.featured}
                  />
                  <span className="checkmark"></span>
                  Marcar como producto destacado
                </label>
                <small style={{ color: '#6b7280', fontStyle: 'italic' }}>
                  Los productos destacados aparecerán en la página principal
                </small>
              </div>
              
              <div className="form-group">
                <label>Imagen Principal</label>
                <div 
                  className={`drag-drop-zone main-image-zone ${mainImageDragActive ? 'drag-active' : ''} ${uploadingMainImage ? 'uploading' : ''}`}
                  onDragEnter={handleMainImageDrag}
                  onDragLeave={handleMainImageDrag}
                  onDragOver={handleMainImageDrag}
                  onDrop={handleMainImageDrop}
                >
                  <input
                    ref={mainImageFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleMainImageSelect}
                    className="file-input"
                    disabled={uploadingMainImage}
                  />
                  <div className="drag-drop-content">
                    {uploadingMainImage ? (
                      <div className="upload-status">
                        <div className="upload-spinner"></div>
                        <p>Subiendo imagen principal...</p>
                      </div>
                    ) : editingProduct.url_imagen ? (
                      <div className="main-image-preview">
                        <img 
                          src={editingProduct.url_imagen} 
                          alt="Imagen principal" 
                          className="preview-image"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                        <p>Imagen principal actual</p>
                        <p className="upload-hint">Arrastra una nueva imagen para reemplazar</p>
                        <button 
                          type="button" 
                          className="select-file-btn"
                          onClick={() => mainImageFileInputRef.current?.click()}
                        >
                          Cambiar Imagen
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="upload-icon">📁</div>
                        <p>Arrastra una imagen aquí o haz clic para seleccionar</p>
                        <p className="upload-hint">Esta será la imagen principal del producto</p>
                        <button 
                          type="button" 
                          className="select-file-btn"
                          onClick={() => mainImageFileInputRef.current?.click()}
                        >
                          Seleccionar Imagen
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="edit-form-actions">
                <button type="button" className="btn-cancel" onClick={handleCancelEdit}>
                  Cancelar
                </button>
                <button type="submit" className="btn-save">
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showStockForm && editingStock && (
        <div className="edit-form-overlay">
          <div className="edit-form-modal stock-modal">
            <div className="edit-form-header">
              <h3>Gestionar Stock - {editingStock.product.nombre}</h3>
              <button className="close-btn" onClick={handleCancelStockEdit}>×</button>
            </div>
            <form onSubmit={handleStockSubmit} className="edit-form">
              <div className="stock-section">
                <h4>Variantes Existentes</h4>
                <div className="stock-items">
                  {editingStock.stockItems.map((item) => (
                    <div key={item.id} className="stock-item">
                      <div className="stock-item-header">
                        <div 
                          className="color-swatch" 
                          style={{ backgroundColor: item.color.codigo_hex }}
                        ></div>
                        <span className="color-name">{item.color.nombre}</span>
                      </div>
                      <div className="stock-item-fields">
                        <div className="form-group">
                          <label htmlFor={`stock_${item.id}`}>Cantidad</label>
                          <input
                            type="number"
                            id={`stock_${item.id}`}
                            name={`stock_${item.id}`}
                            min="0"
                            defaultValue={item.cantidad}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor={`precio_${item.id}`}>Precio (Q)</label>
                          <input
                            type="number"
                            id={`precio_${item.id}`}
                            name={`precio_${item.id}`}
                            step="0.01"
                            min="0"
                            defaultValue={item.precio}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nuevas Variantes */}
              <div className="new-variants-section">
                <div className="section-header">
                  <h4>Agregar Nuevas Variantes</h4>
                  <button 
                    type="button" 
                    className="add-variant-btn"
                    onClick={addNewVariant}
                    disabled={loadingColors}
                  >
                    ➕ Agregar Variante
                  </button>
                </div>
                
                {newVariants.length > 0 && (
                  <div className="stock-items">
                    {newVariants.map((variant) => (
                      <div key={variant.id} className="stock-item new-variant">
                        <div className="stock-item-header">
                          <div className="form-group">
                            <label htmlFor={`color_${variant.id}`}>Color</label>
                            <select
                              id={`color_${variant.id}`}
                              name={`color_${variant.id}`}
                              value={variant.colorId}
                              onChange={(e) => updateNewVariant(variant.id, 'colorId', e.target.value)}
                              required
                            >
                              <option value="">Seleccionar color</option>
                              {availableColors
                                .filter(color => !editingStock.stockItems.some(item => item.color.id === color.id))
                                .map((color) => (
                                  <option key={color.id} value={color.id}>
                                    {color.nombre}
                                  </option>
                                ))}
                            </select>
                          </div>
                          <button
                            type="button"
                            className="remove-variant-btn"
                            onClick={() => removeNewVariant(variant.id)}
                            title="Eliminar variante"
                          >
                            ❌
                          </button>
                        </div>
                        <div className="stock-item-fields">
                          <div className="form-group">
                            <label htmlFor={`stock_${variant.id}`}>Cantidad</label>
                            <input
                              type="number"
                              id={`stock_${variant.id}`}
                              name={`stock_${variant.id}`}
                              min="0"
                              value={variant.cantidad}
                              onChange={(e) => updateNewVariant(variant.id, 'cantidad', parseInt(e.target.value) || 0)}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor={`precio_${variant.id}`}>Precio (Q)</label>
                            <input
                              type="number"
                              id={`precio_${variant.id}`}
                              name={`precio_${variant.id}`}
                              step="0.01"
                              min="0"
                              value={variant.precio}
                              onChange={(e) => updateNewVariant(variant.id, 'precio', parseFloat(e.target.value) || 0)}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="edit-form-actions">
                <button type="button" className="btn-cancel" onClick={handleCancelStockEdit}>
                  Cancelar
                </button>
                <button type="submit" className="btn-save">
                  Guardar Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showImagesForm && editingImages && (
        <div className="edit-form-overlay">
          <div className="edit-form-modal images-modal">
            <div className="edit-form-header">
              <h3>Gestionar Imágenes - {editingImages.product.nombre}</h3>
              <button className="close-btn" onClick={handleCancelImagesEdit}>×</button>
            </div>
            <form onSubmit={handleImagesSubmit} className="edit-form">
              <div className="images-section">
                <h4>Imágenes Actuales</h4>
                <div className="images-grid">
                  {editingImages.images.map((image) => (
                    <div key={image.id} className="image-item">
                      <img 
                        src={image.url_imagen} 
                        alt={`Imagen ${image.id}`}
                        className="product-image"
                        onError={(e) => {
                          e.target.src = '/assets/image-placeholder.png';
                          e.target.alt = 'Imagen no disponible';
                        }}
                      />
                      <button
                        type="button"
                        className="delete-image-btn"
                        onClick={() => handleDeleteImage(image.id)}
                        title="Eliminar imagen"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                  {editingImages.images.length === 0 && (
                    <div className="no-images">
                      <p>No hay imágenes adicionales para este producto</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="add-image-section">
                <h4>Agregar Nueva Imagen</h4>
                <div 
                  className={`drag-drop-zone ${dragActive ? 'drag-active' : ''} ${uploadingImage ? 'uploading' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="file-input"
                    disabled={uploadingImage}
                  />
                  <div className="drag-drop-content">
                    {uploadingImage ? (
                      <div className="upload-status">
                        <div className="upload-spinner"></div>
                        <p>Subiendo imagen...</p>
                      </div>
                    ) : (
                      <>
                        <div className="upload-icon">📁</div>
                        <p>Arrastra una imagen aquí o haz clic para seleccionar</p>
                        <p className="upload-hint">Solo archivos de imagen (JPG, PNG, GIF, etc.)</p>
                        <button 
                          type="button" 
                          className="select-file-btn"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Seleccionar Archivo
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="edit-form-actions">
                <button type="button" className="btn-cancel" onClick={handleCancelImagesEdit}>
                  Cancelar
                </button>
                <button type="submit" className="btn-save">
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="product-table-container">
        {products.length > 0 ? (
          <table className="product-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="product-row">
                  <td className="product-id">#{product.id}</td>
                  <td className="product-name">{product.nombre}</td>
                  <td>
                    <span className="category-badge">{product.categoria}</span>
                  </td>
                  <td className={product.precio ? 'product-price' : 'no-price'}>
                    {product.precio ? `Q${product.precio.toFixed(2)}` : 'Sin precio'}
                  </td>
                  <td>
                    <span className={`stock-badge ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                      {product.stock > 0 ? `📦 ${product.stock} unidades` : '❌ Sin Stock'}
                    </span>
                  </td>
                  <td className="product-actions">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => handleEdit(product)}
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      className="action-btn stock-btn"
                      onClick={() => handleEditStock(product)}
                      title="Gestionar Stock"
                    >
                      📦
                    </button>
                    <button
                      className="action-btn images-btn"
                      onClick={() => handleEditImages(product)}
                      title="Gestionar Imágenes"
                    >
                      🖼️
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDelete(product.id)}
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-products">
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <p>No hay productos disponibles</p>
              <small>Agrega tu primer producto usando el formulario</small>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
