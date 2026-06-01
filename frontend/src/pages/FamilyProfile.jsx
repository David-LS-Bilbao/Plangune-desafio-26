import React from 'react';
import { Link } from 'react-router-dom';

function FamilyProfile() {
  return (
    <div>
      <h2>Mi Familia</h2>
      <p>Configura las edades y preferencias de tu familia para personalizar los planes.</p>
      
      <form>
        <div>
          <label>Rangos de edad de los niños:</label>
          <div>
            <label><input type="checkbox" /> 0-2 años</label>
            <label><input type="checkbox" /> 3-5 años</label>
            <label><input type="checkbox" /> 6-12 años</label>
          </div>
        </div>
        <div>
          <label>Preferencias:</label>
          <textarea placeholder="Ej. Buscamos zonas tranquilas y cambiadores amplios..."></textarea>
        </div>
        <button type="button">Guardar Perfil</button>
      </form>
      
      <br />
      <Link to="/planes">Ir al buscador de planes</Link>
    </div>
  );
}

export default FamilyProfile;
