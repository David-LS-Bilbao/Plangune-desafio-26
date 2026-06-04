import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store";
import { MOCK_USERS } from "../../mocks/data";

function LoginForm() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState("familia.agirre@example.com");
  const [password, setPassword] = useState("password123");

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
        <div className="input-wrapper">
          <span className="material-symbols-outlined input-icon">lock</span>
          <input
            type="password"
            id="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
