import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../store";

/** Destino tras el login, según el rol devuelto por el backend. */
const HOME_BY_ROLE = { family: "/", business: "/negocio/dashboard", admin: "/admin" };

function LoginForm() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(HOME_BY_ROLE[user.role] || "/", { replace: true });
    } catch (err) {
      const status = err?.response?.status;
      setError(
        status === 401
          ? t('auth.error_login')
          : t('auth.error_login_default'),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="login-form-new" onSubmit={handleLogin}>
      {/* Email */}
      <div className="input-group">
        <label className="sr-only" htmlFor="email">
          {t('auth.email_label')}
        </label>
        <div className="input-wrapper">
          <span className="material-symbols-outlined input-icon">mail</span>
          <input
            type="email"
            id="email"
            placeholder={t('auth.email_placeholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      {/* Password */}
      <div className="input-group">
        <label className="sr-only" htmlFor="password">
          {t('auth.password_label')}
        </label>
        <div className="input-wrapper" style={{ position: 'relative' }}>
          <span className="material-symbols-outlined input-icon">lock</span>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            placeholder={t('auth.password_placeholder')}
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

      {/* Error */}
      {error && (
        <p
          role="alert"
          style={{ color: "var(--error-color, #d62828)", margin: "0.25rem 0 0", fontSize: "0.9rem" }}
        >
          {error}
        </p>
      )}

      {/* Submit */}
      <div className="submit-group">
        <button type="submit" className="btn-primary-new" disabled={loading}>
          <span className="material-symbols-outlined">{loading ? "hourglass_top" : "login"}</span>
          {loading ? t('auth.btn_login_loading') : t('auth.btn_login')}
        </button>
      </div>
    </form>
  );
}

export default LoginForm;
