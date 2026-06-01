import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store';

function LoginForm() {
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);
  const [role, setRole] = useState('family');

  const handleLogin = (e) => {
    e.preventDefault();
    login(role);
    if (role === 'family') navigate('/planes');
    else if (role === 'business') navigate('/negocio/dashboard');
    else if (role === 'admin') navigate('/admin');
  };

  return (
    <form className="login-form-new" onSubmit={handleLogin}>
      {/* Role Selector */}
      <div className="input-group">
        <label className="sr-only" htmlFor="role">Simular Rol</label>
        <div className="input-wrapper">
          <span className="material-symbols-outlined input-icon">badge</span>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{
              width: '100%',
              height: '48px',
              paddingLeft: '2.5rem',
              paddingRight: '1rem',
              backgroundColor: 'var(--surface)',
              borderRadius: '0.5rem',
              border: '1px solid var(--outline-variant)',
              color: 'var(--on-surface)',
              fontFamily: 'var(--font-body)',
              fontSize: '16px',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="family">👨‍👩‍👧 Familia (Buscador de planes)</option>
            <option value="business">🏪 Negocio (Gestor de actividades)</option>
            <option value="admin">🛡️ Administrador (Gestión y datos)</option>
          </select>
        </div>
      </div>

      {/* Email */}
      <div className="input-group">
        <label className="sr-only" htmlFor="email">Correo electrónico</label>
        <div className="input-wrapper">
          <span className="material-symbols-outlined input-icon">mail</span>
          <input
            type="email"
            id="email"
            placeholder="tu@email.com"
            defaultValue="demo@txikiplan.com"
          />
        </div>
      </div>

      {/* Password */}
      <div className="input-group">
        <label className="sr-only" htmlFor="password">Contraseña</label>
        <div className="input-wrapper">
          <span className="material-symbols-outlined input-icon">lock</span>
          <input
            type="password"
            id="password"
            placeholder="••••••••"
            defaultValue="password123"
          />
        </div>
      </div>

      {/* Submit */}
      <div className="submit-group">
        <button type="submit" className="btn-primary-new">
          <span className="material-symbols-outlined">login</span>
          Iniciar Sesión
        </button>
      </div>
    </form>
  );
}

export default LoginForm;
