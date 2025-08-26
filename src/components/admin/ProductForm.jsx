'use client';

import { useState, useEffect } from 'react';
import { getCategories } from '@/services/categoryService';
import { getColors } from '@/services/colorService';
import { uploadImageToCloudinary } from '@/services/cloudinaryService';
import { createFullProduct } from '@/services/productService';
import '@/styles/ProductForm.css';

export default function ProductForm({ onProductAdded }) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [urlImagen, setUrlImagen] = useState(''); // Imagen principal
  const [imagenesAdicionales, setImagenesAdicionales] = useState([]); // Imágenes adicionales
  const [categoriaId, setCategoriaId] = useState('');
  const [featured, setFeatured] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [colores, setColores] = useState([]);
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        setError(null);
        
        // Cargar categorías y colores en paralelo
        const [categoriesData, colorsData] = await Promise.all([
          getCategories(),
          getColors()
        ]);
        
        setCategorias(Array.isArray(categoriesData) ? categoriesData : []);
        setColores(Array.isArray(colorsData) ? colorsData : []);
      } catch (error) {
        console.error('Error cargando datos:', error);
        setError('Error al cargar categorías y colores');
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

  const handleMainImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      const url = await uploadImageToCloudinary(file);
      setUrlImagen(url);
    } catch (error) {
      console.error('Error subiendo imagen principal:', error);
      alert('Error al subir la imagen principal');
    } finally {
      setLoading(false);
    }
  };

  const handleAdditionalImagesUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    setUploadingImages(true);
    try {
      const uploadPromises = files.map(file => uploadImageToCloudinary(file));
      const urls = await Promise.all(uploadPromises);
      
      setImagenesAdicionales(prev => [...prev, ...urls]);
      alert(`${files.length} imagen(es) adicional(es) subida(s) exitosamente`);
    } catch (error) {
      console.error('Error subiendo imágenes adicionales:', error);
      alert('Error al subir algunas imágenes adicionales');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeAdditionalImage = (index) => {
    setImagenesAdicionales(prev => prev.filter((_, i) => i !== index));
  };

  const addStockRow = () => {
    setStock([...stock, { color_id: '', cantidad: '', precio: '' }]);
  };

  const handleStockChange = (index, field, value) => {
    const updated = [...stock];
    updated[index][field] = value;
    setStock(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!urlImagen) {
      alert('Debes subir una imagen principal');
      return;
    }

    const sku = `SKU-${Date.now()}`;

    const productData = {
      sku,
      nombre,
      descripcion,
      url_imagen: urlImagen, // Imagen principal
      categoria_id: parseInt(categoriaId),
      featured: featured,
      imagenes_adicionales: imagenesAdicionales, // Array de URLs de imágenes adicionales
      stock: stock.map((s) => ({
        color_id: parseInt(s.color_id),
        cantidad: parseInt(s.cantidad),
        precio: parseFloat(s.precio),
      })),
    };

    try {
      const result = await createFullProduct(productData);
      alert(result.message || 'Producto creado exitosamente');
      
      // Limpiar formulario
      setNombre('');
      setDescripcion('');
      setUrlImagen('');
      setImagenesAdicionales([]);
      setCategoriaId('');
      setFeatured(false);
      setStock([]);
      onProductAdded(); // Llamar la prop para notificar el cambio
    } catch (error) {
      console.error('Error creando producto:', error);
      alert('Error al crear el producto');
    }
  };

  // Mostrar loading mientras se cargan los datos
  if (loadingData) {
    return (
      <div className="product-form">
        <h2>Agregar Producto</h2>
        <div className="loading-message">
          <p>Cargando categorías y colores...</p>
        </div>
      </div>
    );
  }

  // Mostrar error si no se pudieron cargar los datos
  if (error) {
    return (
      <div className="product-form">
        <h2>Agregar Producto</h2>
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-form">
      <h2>Agregar Producto</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nombre del Producto *</label>
          <input
            type="text"
            placeholder="Nombre del producto"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Descripción *</label>
          <textarea
            placeholder="Descripción detallada del producto"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            required
          ></textarea>
        </div>

        <div className="form-group">
          <label>Categoría *</label>
          <select 
            value={categoriaId} 
            onChange={(e) => setCategoriaId(e.target.value)}
            required
          >
            <option value="">Selecciona una categoría</option>
            {categorias && categorias.length > 0 ? (
              categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))
            ) : (
              <option value="" disabled>No hay categorías disponibles</option>
            )}
          </select>
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
            />
            <span className="checkmark"></span>
            Marcar como producto destacado
          </label>
          <small style={{ color: '#6b7280', fontStyle: 'italic' }}>
            Los productos destacados aparecerán en la página principal
          </small>
        </div>

        {/* Imagen Principal */}
        <div className="form-group">
          <label>Imagen Principal *</label>
          <input 
            type="file" 
            accept="image/*"
            onChange={handleMainImageUpload}
            required
          />
          {loading && <p className="upload-status">Subiendo imagen principal...</p>}
          {urlImagen && (
            <div className="image-preview">
              <img src={urlImagen} alt="Imagen principal" width="150" />
              <span className="image-label">Imagen Principal</span>
            </div>
          )}
        </div>

        {/* Imágenes Adicionales */}
        <div className="form-group">
          <label>Imágenes Adicionales (Opcional)</label>
          <input 
            type="file" 
            accept="image/*"
            multiple
            onChange={handleAdditionalImagesUpload}
          />
          {uploadingImages && <p className="upload-status">Subiendo imágenes adicionales...</p>}
          
          {imagenesAdicionales.length > 0 && (
            <div className="additional-images-preview">
              <h4>Imágenes Adicionales ({imagenesAdicionales.length})</h4>
              <div className="images-grid">
                {imagenesAdicionales.map((url, index) => (
                  <div key={index} className="image-item">
                    <img src={url} alt={`Imagen adicional ${index + 1}`} width="100" />
                    <button 
                      type="button" 
                      onClick={() => removeAdditionalImage(index)}
                      className="remove-image-btn"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Variantes de Stock */}
        <div className="form-group">
          <h3>Variantes de Stock</h3>
          {stock.map((item, index) => (
            <div key={index} className="stock-row">
              <select
                value={item.color_id}
                onChange={(e) => handleStockChange(index, 'color_id', e.target.value)}
                required
              >
                <option value="">Selecciona un color</option>
                {colores && colores.length > 0 ? (
                  colores.map((color) => (
                    <option key={color.id} value={color.id}>
                      {color.nombre}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No hay colores disponibles</option>
                )}
              </select>
              <input
                type="number"
                placeholder="Cantidad"
                value={item.cantidad}
                onChange={(e) => handleStockChange(index, 'cantidad', e.target.value)}
                required
                min="0"
              />
              <input
                type="number"
                placeholder="Precio (Q)"
                value={item.precio}
                onChange={(e) => handleStockChange(index, 'precio', e.target.value)}
                required
                min="0"
                step="0.01"
              />
            </div>
          ))}
          <button type="button" onClick={addStockRow} className="add-stock-btn">
            + Agregar variante de stock
          </button>
        </div>

        <button type="submit" className="submit-btn" disabled={loading || uploadingImages}>
          {loading || uploadingImages ? 'Procesando...' : 'Guardar Producto'}
        </button>
      </form>
    </div>
  );
}
