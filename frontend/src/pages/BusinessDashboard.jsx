import React from 'react';
import { Link } from 'react-router-dom';

function BusinessDashboard() {
  return (
    <div>
      <h2>Panel de Negocio</h2>
      
      <div>
        <h3>Resumen</h3>
        <p>Actividades activas: 2 | Ofertas activas: 1</p>
      </div>

      <div>
        <h3>Acciones</h3>
        <button type="button">Crear Nueva Actividad</button>
        <button type="button">Crear Nueva Oferta</button>
      </div>

      <div>
        <h3>Mis Actividades</h3>
        <ul>
          <li>Parque de juegos cubierto (Estado: Aprobado)</li>
          <li>Taller de manualidades (Estado: Pendiente)</li>
        </ul>
      </div>

      <br />
      <Link to="/">Volver al inicio</Link>
    </div>
  );
}

export default BusinessDashboard;
