import React from 'react';
import { Link } from 'react-router-dom';

function AdminDashboard() {
  return (
    <div>
      <h2>Panel de Administración</h2>
      
      <div>
        <h3>Actividades Pendientes de Aprobación</h3>
        <ul>
          <li>
            Taller de manualidades - Negocio XYZ 
            <button type="button">Aprobar</button> 
            <button type="button">Rechazar</button>
          </li>
        </ul>
      </div>

      <div>
        <h3>Moderación</h3>
        <p>No hay reportes de incidencias recientes.</p>
      </div>

      <br />
      <Link to="/">Volver al inicio</Link>
    </div>
  );
}

export default AdminDashboard;
