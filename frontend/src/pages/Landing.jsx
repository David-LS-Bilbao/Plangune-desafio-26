import React from 'react';
import { Link } from 'react-router-dom';

function Landing() {
  return (
    <div>
      <h1>DESAFIO-26 (TxikiPlan Euskadi)</h1>
      <p>Planes con peques, sin sobresaltos.</p>
      <div>
        <Link to="/planes">Buscar planes</Link>
        <br />
        <Link to="/login">Iniciar Sesión / Registro</Link>
      </div>
    </div>
  );
}

export default Landing;
