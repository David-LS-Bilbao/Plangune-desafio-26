import React from 'react';
import { Link, useParams } from 'react-router-dom';

function PlanDetail() {
  const { id } = useParams();

  return (
    <div>
      <h2>Detalle del Plan {id}</h2>
      
      <div>
        <h3>Información Práctica</h3>
        <ul>
          <li><strong>Edad recomendada:</strong> 1-5 años</li>
          <li><strong>Duración:</strong> 2 horas</li>
          <li><strong>Precio:</strong> Gratuito</li>
        </ul>
      </div>

      <div>
        <h3>Sellos Familiares</h3>
        <span>👶 Ideal con bebé</span> | <span>☂️ Plan a cubierto</span> | <span>🛒 Apto carrito</span> | <span>🧘 Ambiente tranquilo</span>
      </div>

      <div>
        <h3>Reseñas (Comunidad)</h3>
        <p><strong>Amaia:</strong> Muy buen sitio, el cambiador está muy limpio.</p>
      </div>

      <div>
        <button type="button">Guardar Favorito</button>
        <button type="button">Reportar Incidencia</button>
      </div>

      <br />
      <Link to="/planes">Volver a Resultados</Link>
    </div>
  );
}

export default PlanDetail;
