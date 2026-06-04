import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store";
import LoginForm from "../components/auth/LoginForm";
import NavbarResponsive from "../components/common/NavbarResponsive";
import '../styles/login.css';

function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [registerRole, setRegisterRole] = useState("");

  const handleRegister = () => {
    if (registerRole === "family") {
      navigate("/crear-familia");
    } else if (registerRole === "business") {
      navigate("/crear-negocio");
    }
  };

  return (
    <>
      <NavbarResponsive />
      <div className="login-wrapper">
        <div className="login-card">

          <div className="login-header">
            <h1>Tu familia, <br /><span>tus planes.</span></h1>
            <p>
              Regístrate y disfruta más, buscando menos.
            </p>
          </div>

          <div className="login-body">

            <LoginForm />

            <div className="social-divider">
              <div className="divider-line"></div>
              <span className="divider-text">o continuar con</span>
              <div className="divider-line"></div>
            </div>

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
                  disabled={!registerRole}
                >
                  Registrarse
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
