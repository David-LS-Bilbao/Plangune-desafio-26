import React from 'react';
import { Link } from 'react-router-dom';

function Login() {
  return (
    <div>
      <h2>Iniciar Sesión / Registro</h2>
      <form>
        <div>
          <label>Email:</label>
          <input type="email" placeholder="ejemplo@correo.com" />
        </div>
        <div>
          <label>Contraseña:</label>
          <input type="password" placeholder="********" />
        </div>
        <div>
          <label>Rol:</label>
          <select>
            <option value="family">Familia</option>
            <option value="business">Negocio</option>
          </select>
        </div>
        <button type="button">Entrar</button>
      </form>
      <br />
      <Link to="/">Volver al inicio</Link>
    </div>
  );
}

export default Login;
