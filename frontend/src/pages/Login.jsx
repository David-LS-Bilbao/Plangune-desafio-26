import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../store";
import LoginForm from "../components/auth/LoginForm";

function Login() {
  const { t } = useTranslation();
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
    <div className="login-wrapper">
      <div className="login-background" />
      <div className="login-overlay" />

      <div className="login-main-new">
        <div className="login-card-new">
          {/* Brand Header */}
          <div className="brand-header">
            <span className="material-symbols-outlined brand-icon">
              family_restroom
            </span>
            <h1 className="brand-title">TxikiPlan</h1>
            <p className="brand-subtitle">
              {t('loginPage.subtitle', 'Encuentra los mejores planes para disfrutar en familia')}
            </p>
          </div>

          <h2 className="login-title">{t('loginPage.welcomeBack', 'Bienvenido de nuevo')}</h2>

          <LoginForm />

          {/* Social Divider */}
          <div className="social-divider">
            <div className="divider-line"></div>
            <span className="divider-text">{t('loginPage.orContinueWith', 'o continuar con')}</span>
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
              {t('loginPage.noAccount', '¿No tienes cuenta? Elige tu perfil:')}
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
                  <span className="role-title">{t('loginPage.family', 'Familia')}</span>
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
                  <span className="role-title">{t('loginPage.business', 'Negocio')}</span>
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
                {t('loginPage.register', 'Registrarse →')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
