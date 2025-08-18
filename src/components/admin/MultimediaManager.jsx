import React, { useState, useEffect, useRef } from 'react';
import { uploadToCloudinary } from '@/services/cloudinaryService';
import '../../styles/MultimediaManager.css';

const MultimediaManager = () => {
  const [activeTab, setActiveTab] = useState('hero');
  const [heroImages, setHeroImages] = useState([]);
  const [promoBanners, setPromoBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingHero, setEditingHero] = useState(null);
  const [editingPromo, setEditingPromo] = useState(null);
  const [showHeroForm, setShowHeroForm] = useState(false);
  const [showPromoForm, setShowPromoForm] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  // Formularios
  const [heroForm, setHeroForm] = useState({
    titulo: '',
    subtitulo: '',
    orden: 0,
    activo: true
  });

  const [promoForm, setPromoForm] = useState({
    titulo: '',
    descripcion: '',
    enlace: '',
    orden: 0,
    activo: true
  });

  useEffect(() => {
    fetchHeroImages();
    fetchPromoBanners();
  }, []);

  const fetchHeroImages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/multimedia/hero');
      const data = await response.json();
      if (data.success) {
        setHeroImages(data.data);
      }
    } catch (error) {
      console.error('Error fetching hero images:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPromoBanners = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/multimedia/promo');
      const data = await response.json();
      if (data.success) {
        setPromoBanners(data.data);
      }
    } catch (error) {
      console.error('Error fetching promo banners:', error);
    } finally {
      setLoading(false);
    }
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

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = async (e) => {
    if (e.target.files && e.target.files[0]) {
      await handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file) => {
    try {
      setUploadingImage(true);
      
      // Verificar variables de entorno
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
      
      if (!cloudName || !uploadPreset) {
        throw new Error('Configuración de Cloudinary incompleta. Verifica NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME y NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET');
      }

      const result = await uploadToCloudinary(file, 'megatienda/multimedia');
      
      if (activeTab === 'hero') {
        setHeroForm(prev => ({ ...prev, url_imagen: result.secure_url, cloudinary_id: result.public_id }));
      } else {
        setPromoForm(prev => ({ ...prev, url_imagen: result.secure_url, cloudinary_id: result.public_id }));
      }
      
      alert('Imagen subida exitosamente');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert(`Error al subir imagen: ${error.message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleHeroSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const url = editingHero 
        ? `/api/admin/multimedia/hero/${editingHero.id}`
        : '/api/admin/multimedia/hero';
      
      const method = editingHero ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(heroForm)
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(editingHero ? 'Imagen de Hero actualizada' : 'Imagen de Hero creada');
        setShowHeroForm(false);
        setEditingHero(null);
        setHeroForm({ titulo: '', subtitulo: '', orden: 0, activo: true });
        fetchHeroImages();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error saving hero image:', error);
      alert('Error al guardar imagen de Hero');
    } finally {
      setLoading(false);
    }
  };

  const handlePromoSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const url = editingPromo 
        ? `/api/admin/multimedia/promo/${editingPromo.id}`
        : '/api/admin/multimedia/promo';
      
      const method = editingPromo ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promoForm)
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(editingPromo ? 'Banner promocional actualizado' : 'Banner promocional creado');
        setShowPromoForm(false);
        setEditingPromo(null);
        setPromoForm({ titulo: '', descripcion: '', enlace: '', orden: 0, activo: true });
        fetchPromoBanners();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error saving promo banner:', error);
      alert('Error al guardar banner promocional');
    } finally {
      setLoading(false);
    }
  };

  const handleEditHero = (hero) => {
    setEditingHero(hero);
    setHeroForm({
      titulo: hero.titulo,
      subtitulo: hero.subtitulo || '',
      orden: hero.orden,
      activo: hero.activo,
      url_imagen: hero.url_imagen,
      cloudinary_id: hero.cloudinary_id
    });
    setShowHeroForm(true);
  };

  const handleEditPromo = (promo) => {
    setEditingPromo(promo);
    setPromoForm({
      titulo: promo.titulo,
      descripcion: promo.descripcion || '',
      enlace: promo.enlace || '',
      orden: promo.orden,
      activo: promo.activo,
      url_imagen: promo.url_imagen,
      cloudinary_id: promo.cloudinary_id
    });
    setShowPromoForm(true);
  };

  const handleDeleteHero = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta imagen de Hero?')) return;
    
    try {
      const response = await fetch(`/api/admin/multimedia/hero/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Imagen de Hero eliminada');
        fetchHeroImages();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting hero image:', error);
      alert('Error al eliminar imagen de Hero');
    }
  };

  const handleDeletePromo = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este banner promocional?')) return;
    
    try {
      const response = await fetch(`/api/admin/multimedia/promo/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Banner promocional eliminado');
        fetchPromoBanners();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting promo banner:', error);
      alert('Error al eliminar banner promocional');
    }
  };

  return (
    <div className="multimedia-manager">
      <div className="multimedia-header">
        <h2>Gestión de Multimedia</h2>
        <p>Administra las imágenes de Hero y banners promocionales</p>
      </div>

      <div className="multimedia-tabs">
        <button 
          className={`tab ${activeTab === 'hero' ? 'active' : ''}`}
          onClick={() => setActiveTab('hero')}
        >
          Imágenes de Hero
        </button>
        <button 
          className={`tab ${activeTab === 'promo' ? 'active' : ''}`}
          onClick={() => setActiveTab('promo')}
        >
          Banners Promocionales
        </button>
      </div>

      {activeTab === 'hero' && (
        <div className="multimedia-section">
          <div className="section-header">
            <h3>Imágenes de Hero</h3>
            <button 
              className="btn-add"
              onClick={() => {
                setEditingHero(null);
                setHeroForm({ titulo: '', subtitulo: '', orden: 0, activo: true });
                setShowHeroForm(true);
              }}
            >
              + Agregar Imagen de Hero
            </button>
          </div>

          {showHeroForm && (
            <div className="form-overlay">
              <div className="form-container">
                <h4>{editingHero ? 'Editar' : 'Agregar'} Imagen de Hero</h4>
                
                <form onSubmit={handleHeroSubmit}>
                  <div className="form-group">
                    <label>Título *</label>
                    <input
                      type="text"
                      value={heroForm.titulo}
                      onChange={(e) => setHeroForm(prev => ({ ...prev, titulo: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Subtítulo</label>
                    <textarea
                      value={heroForm.subtitulo}
                      onChange={(e) => setHeroForm(prev => ({ ...prev, subtitulo: e.target.value }))}
                    />
                  </div>

                  <div className="form-group">
                    <label>Orden</label>
                    <input
                      type="number"
                      value={heroForm.orden}
                      onChange={(e) => setHeroForm(prev => ({ ...prev, orden: parseInt(e.target.value) || 0 }))}
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={heroForm.activo}
                        onChange={(e) => setHeroForm(prev => ({ ...prev, activo: e.target.checked }))}
                      />
                      Activo
                    </label>
                  </div>

                  <div className="form-group">
                    <label>Imagen *</label>
                    <div 
                      className={`upload-area ${dragActive ? 'drag-active' : ''}`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {heroForm.url_imagen ? (
                        <img src={heroForm.url_imagen} alt="Preview" className="image-preview" />
                      ) : (
                        <div className="upload-placeholder">
                          {uploadingImage ? (
                            <p>Subiendo imagen...</p>
                          ) : (
                            <>
                              <p>Arrastra una imagen aquí o haz clic para seleccionar</p>
                              <small>Formatos: JPG, PNG, WebP</small>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                    />
                  </div>

                  <div className="form-actions">
                    <button type="submit" disabled={loading || !heroForm.url_imagen}>
                      {loading ? 'Guardando...' : (editingHero ? 'Actualizar' : 'Crear')}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setShowHeroForm(false)}
                      className="btn-cancel"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="items-grid">
            {heroImages.map((hero) => (
              <div key={hero.id} className="item-card">
                <img src={hero.url_imagen} alt={hero.titulo} />
                <div className="item-info">
                  <h4>{hero.titulo}</h4>
                  {hero.subtitulo && <p>{hero.subtitulo}</p>}
                  <div className="item-meta">
                    <span className={`status ${hero.activo ? 'active' : 'inactive'}`}>
                      {hero.activo ? 'Activo' : 'Inactivo'}
                    </span>
                    <span className="order">Orden: {hero.orden}</span>
                  </div>
                </div>
                <div className="item-actions">
                  <button onClick={() => handleEditHero(hero)} className="btn-edit">
                    ✏️
                  </button>
                  <button onClick={() => handleDeleteHero(hero.id)} className="btn-delete">
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'promo' && (
        <div className="multimedia-section">
          <div className="section-header">
            <h3>Banners Promocionales</h3>
            <button 
              className="btn-add"
              onClick={() => {
                setEditingPromo(null);
                setPromoForm({ titulo: '', descripcion: '', enlace: '', orden: 0, activo: true });
                setShowPromoForm(true);
              }}
            >
              + Agregar Banner Promocional
            </button>
          </div>

          {showPromoForm && (
            <div className="form-overlay">
              <div className="form-container">
                <h4>{editingPromo ? 'Editar' : 'Agregar'} Banner Promocional</h4>
                
                <form onSubmit={handlePromoSubmit}>
                  <div className="form-group">
                    <label>Título *</label>
                    <input
                      type="text"
                      value={promoForm.titulo}
                      onChange={(e) => setPromoForm(prev => ({ ...prev, titulo: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Descripción</label>
                    <textarea
                      value={promoForm.descripcion}
                      onChange={(e) => setPromoForm(prev => ({ ...prev, descripcion: e.target.value }))}
                    />
                  </div>

                  <div className="form-group">
                    <label>Enlace</label>
                    <input
                      type="url"
                      value={promoForm.enlace}
                      onChange={(e) => setPromoForm(prev => ({ ...prev, enlace: e.target.value }))}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="form-group">
                    <label>Orden</label>
                    <input
                      type="number"
                      value={promoForm.orden}
                      onChange={(e) => setPromoForm(prev => ({ ...prev, orden: parseInt(e.target.value) || 0 }))}
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={promoForm.activo}
                        onChange={(e) => setPromoForm(prev => ({ ...prev, activo: e.target.checked }))}
                      />
                      Activo
                    </label>
                  </div>

                  <div className="form-group">
                    <label>Imagen *</label>
                    <div 
                      className={`upload-area ${dragActive ? 'drag-active' : ''}`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {promoForm.url_imagen ? (
                        <img src={promoForm.url_imagen} alt="Preview" className="image-preview" />
                      ) : (
                        <div className="upload-placeholder">
                          {uploadingImage ? (
                            <p>Subiendo imagen...</p>
                          ) : (
                            <>
                              <p>Arrastra una imagen aquí o haz clic para seleccionar</p>
                              <small>Formatos: JPG, PNG, WebP</small>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                    />
                  </div>

                  <div className="form-actions">
                    <button type="submit" disabled={loading || !promoForm.url_imagen}>
                      {loading ? 'Guardando...' : (editingPromo ? 'Actualizar' : 'Crear')}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setShowPromoForm(false)}
                      className="btn-cancel"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="items-grid">
            {promoBanners.map((promo) => (
              <div key={promo.id} className="item-card">
                <img src={promo.url_imagen} alt={promo.titulo} />
                <div className="item-info">
                  <h4>{promo.titulo}</h4>
                  {promo.descripcion && <p>{promo.descripcion}</p>}
                  {promo.enlace && <a href={promo.enlace} target="_blank" rel="noopener noreferrer">Ver enlace</a>}
                  <div className="item-meta">
                    <span className={`status ${promo.activo ? 'active' : 'inactive'}`}>
                      {promo.activo ? 'Activo' : 'Inactivo'}
                    </span>
                    <span className="order">Orden: {promo.orden}</span>
                  </div>
                </div>
                <div className="item-actions">
                  <button onClick={() => handleEditPromo(promo)} className="btn-edit">
                    ✏️
                  </button>
                  <button onClick={() => handleDeletePromo(promo.id)} className="btn-delete">
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultimediaManager;
