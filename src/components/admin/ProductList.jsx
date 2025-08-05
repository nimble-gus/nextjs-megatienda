import React, { useEffect, useState } from 'react';
import { getProducts } from '../../services/productService';
import '../../styles/ProductList.css';

const ProductList = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        getProducts().then(setProducts);
    }, []);

    return (
        <div className="product-list">
            <h2>Productos Existentes</h2>
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
                    {products.map((p) => (
                        <tr key={p.id}>
                            <td>{p.id}</td>
                            <td>{p.nombre}</td>
                            <td>{p.categoria?.nombre}</td>
                            <td>${Math.min(...p.stock.map(s => s.precio)).toFixed(2)}</td>
                            <td>{p.stock.reduce((sum, s) => sum + s.cantidad, 0)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProductList;
