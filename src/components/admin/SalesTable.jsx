'use client';

import { useState } from 'react';
import '@/styles/SalesTable.css';

export default function SalesTable({ sales }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Calcular datos de paginación
  const totalPages = Math.ceil(sales.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSales = sales.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="sales-table-container">
      <div className="sales-header">
        <h2>Historial de Ventas</h2>
        {sales.length > 0 && (
          <div className="sales-info">
            <span>Mostrando {startIndex + 1}-{Math.min(endIndex, sales.length)} de {sales.length} ventas</span>
          </div>
        )}
      </div>
      
      <div className="table-wrapper">
        <table className="sales-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {currentSales.length > 0 ? (
              currentSales.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{new Date(s.fecha).toLocaleDateString('es-ES')}</td>
                  <td>{s.cliente}</td>
                  <td>Q{s.total.toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="no-data">
                  No hay ventas registradas en este periodo.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="sales-pagination">
          <button 
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            ← Anterior
          </button>
          
          <div className="page-numbers">
            {getPageNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' ? handlePageChange(page) : null}
                className={`pagination-btn ${page === currentPage ? 'active' : ''} ${typeof page !== 'number' ? 'disabled' : ''}`}
                disabled={typeof page !== 'number'}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button 
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
}