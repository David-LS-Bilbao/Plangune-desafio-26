import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store";
import LoginForm from "../components/auth/LoginForm";
import Navbar from "../components/common/Navbar";
import '../styles/login.css';

function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [registerRole, setRegisterRole] = useState("family");

  const handleRegister = () => {
    if (registerRole === "family") {
      navigate("/crear-familia");
    } else {
      navigate("/crear-negocio");
    }
  };

  return (
    <>
    <Navbar />
    <div className="login-wrapper">
      <div className="login-main-new">
        <div className="login-desktop-panel">
          <h2 className="desktop-panel-title">Tu familia, tus planes</h2>
          <p className="desktop-panel-text">
            Descubre las mejores actividades para disfrutar con tus peques en Euskadi.
          </p>
        </div>

        <div className="login-card-new">


          <LoginForm />

          {/* Social Divider */}
          <div className="social-divider">
            <div className="divider-line"></div>
            <span className="divider-text">o continuar con</span>
            <div className="divider-line"></div>
          </div>

          {/* Social Buttons */}
          <div className="social-buttons">
            <button
              className="btn-social"
              type="button"
              onClick={() => {
                login("family");
                navigate("/planes");
              }}
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="social-icon"
              />
              <span>Google</span>
            </button>
          </div>

          {/* Register */}
          <div className="registration-section">
            <p className="registration-text">
              ¿No tienes cuenta? Elige tu perfil:
            </p>
            <div className="role-grid">
              <label className="role-label">
                <input
                  type="radio"
                  name="register-role"
                  value="family"
                  className="sr-only"
                  checked={registerRole === "family"}
                  onChange={() => setRegisterRole("family")}
                />
                <div className="role-card">
                  <span className="material-symbols-outlined role-icon-primary">
                    family_restroom
                  </span>
                  <span className="role-title">Familia</span>
                  <div className="check-icon">
                    <span className="material-symbols-outlined fill">
                      check_circle
                    </span>
                  </div>
                </div>
              </label>
              <label className="role-label">
                <input
                  type="radio"
                  name="register-role"
                  value="business"
                  className="sr-only"
                  checked={registerRole === "business"}
                  onChange={() => setRegisterRole("business")}
                />
                <div className="role-card">
                  <span className="material-symbols-outlined role-icon-secondary">
                    storefront
                  </span>
                  <span className="role-title">Negocio</span>
                  <div className="check-icon">
                    <span className="material-symbols-outlined fill">
                      check_circle
                    </span>
                  </div>
                </div>
              </label>
            </div>
            <div className="continue-action">
              <button
                type="button"
                className="btn-link"
                onClick={handleRegister}
              >
                Registrarse →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default Login;
