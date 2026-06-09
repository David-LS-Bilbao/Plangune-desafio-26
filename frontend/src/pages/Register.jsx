import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../store";
import NavbarResponsive from "../components/common/NavbarResponsive";
import "../styles/login.css";

/** Destino tras registrarse, según el rol elegido. */
const HOME_BY_ROLE = { family: "/buscar", business: "/negocio", admin: "/admin" };

/**
 * Registro público mínimo (email + contraseña + rol family/business).
 * Al crear la cuenta se inicia sesión (cookie httpOnly) y se redirige según el rol.
 * El registro de administradores NO está disponible públicamente (solo vía seed/DB).
 */
function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const registerAccount = useAuthStore((state) => state.register);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(location.state?.role || "family");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const user = await registerAccount({ email, password, role });
      navigate(HOME_BY_ROLE[user.role] || "/", { replace: true });
    } catch (err) {
      const status = err?.response?.status;
      if (status === 409) {
        setError(t('auth.error_register_exists'));
      } else if (status === 422) {
        setError(t('auth.error_register_invalid'));
      } else {
        setError(t('auth.error_register_default'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavbarResponsive />
      <div className="login-wrapper">
        <div className="login-card">
          <div className="login-header">
            <h1>{t('auth.register_title')}</h1>
            <p>{t('auth.register_subtitle')}</p>
          </div>

          <div className="login-body">
            <form className="login-form-new" onSubmit={handleSubmit}>
              {/* Email */}
              <div className="input-group">
                <label className="sr-only" htmlFor="email">{t('auth.email_label')}</label>
                <div className="input-wrapper">
                  <span className="material-symbols-outlined input-icon">mail</span>
                  <input
                    type="email"
                    id="email"
                    placeholder={t('auth.email_placeholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="input-group">
                <label className="sr-only" htmlFor="password">{t('auth.password_label')}</label>
                <div className="input-wrapper">
                  <span className="material-symbols-outlined input-icon">lock</span>
                  <input
                    type="password"
                    id="password"
                    placeholder={t('auth.password_placeholder')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={8}
                    required
                  />
                </div>
              </div>

              {/* Rol */}
              <div className="registration-section" style={{ marginTop: 0 }}>
                <p className="registration-text">{t('auth.how_to_use')}</p>
                <div className="role-grid">
                  <label className="role-label">
                    <input
                      type="radio"
                      name="role"
                      value="family"
                      className="sr-only"
                      checked={role === "family"}
                      onChange={() => setRole("family")}
                    />
                    <div className="role-card">
                      <span className="material-symbols-outlined role-icon-primary">family_restroom</span>
                      <span className="role-title">{t('roles.family')}</span>
                      <div className="check-icon">
                        <span className="material-symbols-outlined fill">check_circle</span>
                      </div>
                    </div>
                  </label>
                  <label className="role-label">
                    <input
                      type="radio"
                      name="role"
                      value="business"
                      className="sr-only"
                      checked={role === "business"}
                      onChange={() => setRole("business")}
                    />
                    <div className="role-card">
                      <span className="material-symbols-outlined role-icon-secondary">storefront</span>
                      <span className="role-title">{t('roles.business')}</span>
                      <div className="check-icon">
                        <span className="material-symbols-outlined fill">check_circle</span>
                      </div>
                    </div>
                  </label>
                  <label className="role-label">
                    <input
                      type="radio"
                      name="role"
                      value="admin"
                      className="sr-only"
                      checked={role === "admin"}
                      onChange={() => setRole("admin")}
                    />
                    <div className="role-card">
                      <span className="material-symbols-outlined role-icon-secondary" style={{color: "var(--accent-color)"}}>admin_panel_settings</span>
                      <span className="role-title">Admin</span>
                      <div className="check-icon">
                        <span className="material-symbols-outlined fill">check_circle</span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {error && (
                <p role="alert" style={{ color: "var(--error-color, #d62828)", margin: "0.25rem 0 0", fontSize: "0.9rem" }}>
                  {error}
                </p>
              )}

              <div className="submit-group">
                <button type="submit" className="btn-primary-new" disabled={loading}>
                  <span className="material-symbols-outlined">{loading ? "hourglass_top" : "person_add"}</span>
                  {loading ? t('auth.btn_create_account_loading') : t('auth.btn_create_account')}
                </button>
              </div>
            </form>

            <div className="registration-section">
              <p className="registration-text">
                {t('auth.already_have_account')} <Link to="/login" className="btn-link">{t('auth.btn_login_link')}</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Register;
