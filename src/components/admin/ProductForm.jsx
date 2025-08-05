'use client';

import { useState, useEffect } from 'react';
import { getCategories } from '@/services/categoryService';
import { getColors } from '@/services/colorService';
import { uploadImageToCloudinary } from '@/services/cloudinaryService';
import { createFullProduct } from '@/services/productService';
import '@/styles/ProductForm.css';

export default function ProductForm() {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [urlImagen, setUrlImagen] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [colores, setColores] = useState([]);
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCategories().then(setCategorias);
    getColors().then(setColores);
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    const url = await uploadImageToCloudinary(file);
    setUrlImagen(url);
    setLoading(false);
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

    const sku = `SKU-${Date.now()}`;

    const productData = {
      sku,
      nombre,
      descripcion,
      url_imagen: urlImagen,
      categoria_id: parseInt(categoriaId),
      stock: stock.map((s) => ({
        color_id: parseInt(s.color_id),
        cantidad: parseInt(s.cantidad),
        precio: parseFloat(s.precio),
      })),
    };

    const result = await createFullProduct(productData);
    alert(result.message || 'Producto creado');

    setNombre('');
    setDescripcion('');
    setUrlImagen('');
    setCategoriaId('');
    setStock([]);
  };

  return (
    <div className="product-form">
      <h2>Agregar Producto</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <textarea
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        ></textarea>

        <select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
          <option value="">Selecciona una categoría</option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nombre}
            </option>
          ))}
        </select>

        <input type="file" onChange={handleImageUpload} />
        {loading && <p>Subiendo imagen...</p>}
        {urlImagen && <img src={urlImagen} alt="Preview" width="100" />}

        <h3>Variantes de Stock</h3>
        {stock.map((item, index) => (
          <div key={index} className="stock-row">
            <select
              value={item.color_id}
              onChange={(e) => handleStockChange(index, 'color_id', e.target.value)}
            >
              <option value="">Selecciona un color</option>
              {colores.map((color) => (
                <option key={color.id} value={color.id}>
                  {color.nombre}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Cantidad"
              value={item.cantidad}
              onChange={(e) => handleStockChange(index, 'cantidad', e.target.value)}
            />
            <input
              type="number"
              placeholder="Precio"
              value={item.precio}
              onChange={(e) => handleStockChange(index, 'precio', e.target.value)}
            />
          </div>
        ))}
        <button type="button" onClick={addStockRow}>
          + Agregar variante
        </button>

        <button type="submit">Guardar Producto</button>
      </form>
    </div>
  );
}
