'use client';

import React, { useEffect, useState } from 'react';
// Función para obtener productos del admin
const getAdminProducts = async () => {
    const response = await fetch('/api/admin/products');
    if (!response.ok) {
        throw new Error('Error al obtener productos');
    }
    return response.json();
};
import '../../styles/ProductList.css';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await getAdminProducts();
                setProducts(response.products || []);
            } catch (error) {
                console.error('Error cargando productos:', error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    return (
        <div className="product-list">
            <h2>Productos Existentes</h2>
            {loading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    Cargando productos...
                </div>
            ) : (
                <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Categoría</th>
                        <th>Precio (mínimo)</th>
                        <th>Stock total</th>
                    </tr>
                </thead>
                <tbody>
                    {products && products.length > 0 ? (
                        products.map((p) => (
                            <tr key={p.id}>
                                <td>{p.id}</td>
                                <td>{p.nombre}</td>
                                <td>{p.categoria?.nombre || 'Sin categoría'}</td>
                                <td>
                                    {p.stock && p.stock.length > 0 
                                        ? `Q${Math.min(...p.stock.map(s => s.precio)).toFixed(2)}`
                                        : 'Sin precio'
                                    }
                                </td>
                                <td>
                                    {p.stock && p.stock.length > 0
                                        ? p.stock.reduce((sum, s) => sum + s.cantidad, 0)
                                        : 0
                                    }
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" style={{ textAlign: 'center' }}>
                                No hay productos disponibles
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            )}
        </div>
    );
};

export default ProductList;
