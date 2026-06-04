import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store";
import { MOCK_USERS } from "../../mocks/data";

function LoginForm() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState("familia.agirre@example.com");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Auto-detect role based on email or use MOCK_USERS
    let detectedRole = "family";
    const foundUser = Object.values(MOCK_USERS).find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (foundUser) {
      detectedRole = foundUser.role;
    } else if (email.toLowerCase().includes("admin")) {
      detectedRole = "admin";
    } else if (email.toLowerCase().includes("negocio") || email.toLowerCase().includes("business") || email.toLowerCase().includes("info")) {
      detectedRole = "business";
    }

    login(detectedRole);
    
    if (detectedRole === "family") navigate("/planes");
    else if (detectedRole === "business") navigate("/negocio/dashboard");
    else if (detectedRole === "admin") navigate("/admin");
  };

  return (
    <form className="login-form-new" onSubmit={handleLogin}>
      {/* Email */}
      <div className="input-group">
        <label className="sr-only" htmlFor="email">
          Correo electrónico
        </label>
        <div className="input-wrapper">
          <span className="material-symbols-outlined input-icon">mail</span>
          <input
            type="email"
            id="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      {/* Password */}
      <div className="input-group">
        <label className="sr-only" htmlFor="password">
          Contraseña
        </label>
        <div className="input-wrapper" style={{ position: 'relative' }}>
          <span className="material-symbols-outlined input-icon">lock</span>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ paddingRight: '2.5rem' }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            style={{
              position: 'absolute',
              right: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--on-surface-variant)',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              {showPassword ? "visibility_off" : "visibility"}
            </span>
          </button>
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
