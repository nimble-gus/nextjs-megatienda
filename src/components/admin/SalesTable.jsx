'use client';

import '@/styles/SalesTable.css';

export default function SalesTable({ sales }) {
  return (
    <div className="sales-table-container">
      <h2>Historial de Ventas</h2>
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
          {sales.length > 0 ? (
            sales.map((s) => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>{new Date(s.fecha).toLocaleDateString('es-ES')}</td>
                <td>{s.cliente}</td>
                <td>${s.total.toFixed(2)}</td>
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
  );
}