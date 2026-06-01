import React from 'react';
import { Link } from 'react-router-dom';

function PlansList() {
  return (
    <div>
      <h2>Buscador de Planes</h2>
      
      <div>
        <h3>Filtros Rápidos</h3>
        <ul>
          <li><label><input type="checkbox" /> Ideal con bebé (0-2 años)</label></li>
          <li><label><input type="checkbox" /> Plan a cubierto</label></li>
          <li><label><input type="checkbox" /> Apto carrito</label></li>
          <li><label><input type="checkbox" /> Ambiente tranquilo</label></li>
        </ul>
      </div>

      <div>
        <h3>Resultados (Mock)</h3>
        <div>
          <h4>Plan 1: Parque de juegos cubierto</h4>
          <p>Edad: 1-5 años | Apto carrito: Sí</p>
          <p>Family Score: 85 (Ideal con bebé, A cubierto)</p>
          <Link to="/planes/1">Ver Detalle</Link>
        </div>
        <br />
        <div>
          <h4>Plan 2: Ruta fácil por la naturaleza</h4>
          <p>Edad: 3+ años | Apto carrito: No</p>
          <p>Family Score: 70 (Naturaleza)</p>
          <Link to="/planes/2">Ver Detalle</Link>
        </div>
      </div>
      
      <br />
      <Link to="/">Volver al inicio</Link>
    </div>
  );
}

export default PlansList;
