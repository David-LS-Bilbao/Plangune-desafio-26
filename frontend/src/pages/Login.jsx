import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/auth/LoginForm";
import NavbarResponsive from "../components/common/NavbarResponsive";
import { useTranslation, Trans } from "react-i18next";
import { useAuthStore } from "../store";
import '../styles/login.css';

/** Destino tras crear cuenta, según el rol elegido. */
const HOME_BY_ROLE = { family: "/", business: "/negocio/dashboard" };

/**
 * Cuentas demo "resueltas por Google" (presentación/demo, sin OAuth real): una
 * por rol, con email/contraseña fijos. Al elegir el perfil en la ventana flotante,
 * la cuenta correspondiente se crea ya lista (o se reutiliza si ya existía).
 */
const GOOGLE_DEMO_ACCOUNTS = {
  family: { email: "demo.familia@plangune.test", password: "DemoGoogle26!" },
  business: { email: "demo.negocio@plangune.test", password: "DemoGoogle26!" },
};

function Login() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const registerAccount = useAuthStore((state) => state.register);
  const loginAccount = useAuthStore((state) => state.login);
  const [registerRole, setRegisterRole] = useState("");
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleError, setGoogleError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  /** "Continuar con Google": abre la ventana flotante para elegir el perfil. */
  const handleGoogleClick = () => {
    setGoogleError("");
    setShowGoogleModal(true);
  };

  const closeGoogleModal = () => {
    if (googleLoading) return;
    setShowGoogleModal(false);
  };

  /** Crea (o inicia sesión en) la cuenta demo de Google del rol elegido y navega directa. */
  const handleGoogleRole = async (role) => {
    if (googleLoading) return;
    setGoogleError("");
    setGoogleLoading(true);
    const account = GOOGLE_DEMO_ACCOUNTS[role];
    try {
      let user;
      try {
        user = await registerAccount({ ...account, role });
      } catch (err) {
        if (err?.response?.status === 409) {
          user = await loginAccount(account.email, account.password);
        } else {
          throw err;
        }
      }
      navigate(HOME_BY_ROLE[user.role] || "/", { replace: true });
    } catch {
      setGoogleError(t('auth.error_login_default'));
      setGoogleLoading(false);
    }
  };

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
            <h1><Trans i18nKey="auth.login_title">Tu familia, <span>tus planes.</span></Trans></h1>
            <p>
              {t('auth.login_subtitle')}
            </p>
          </div>

          <div className="login-body">

            <LoginForm onGoogleClick={handleGoogleClick} />

            <div className="registration-section">
              <p className="registration-text">
                {t('auth.no_account')}
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
                    <span className="role-title">{t('roles.family')}</span>
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
                    <span className="role-title">{t('roles.business')}</span>
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
                  {t('auth.btn_register')}
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Ventana flotante "Continuar con Google": elegir perfil y crear la cuenta al instante */}
      {showGoogleModal && createPortal(
        <div className="google-role-overlay" onClick={closeGoogleModal}>
          <div className="google-role-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="google-role-modal__close"
              aria-label={t('auth.google_modal_close')}
              onClick={closeGoogleModal}
              disabled={googleLoading}
            >
              <span className="material-symbols-outlined" aria-hidden="true">close</span>
            </button>

            <p className="google-role-modal__title">{t('auth.google_modal_title')}</p>

            {googleError && (
              <p role="alert" className="google-role-modal__error">{googleError}</p>
            )}

            <div className="role-grid">
              <button
                type="button"
                className="role-card"
                disabled={googleLoading}
                onClick={() => handleGoogleRole("family")}
              >
                <span className="material-symbols-outlined role-icon-primary" aria-hidden="true">
                  family_restroom
                </span>
                <span className="role-title">{t('roles.family')}</span>
              </button>
              <button
                type="button"
                className="role-card"
                disabled={googleLoading}
                onClick={() => handleGoogleRole("business")}
              >
                <span className="material-symbols-outlined role-icon-secondary" aria-hidden="true">
                  storefront
                </span>
                <span className="role-title">{t('roles.business')}</span>
              </button>
            </div>

            {googleLoading && (
              <p className="google-role-modal__status">{t('auth.btn_login_loading')}</p>
            )}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

export default Login;
