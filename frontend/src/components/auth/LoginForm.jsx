import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../store";

/** Destino tras el login, según el rol devuelto por el backend. */
const HOME_BY_ROLE = { family: "/", business: "/negocio/dashboard", admin: "/admin" };

function LoginForm({ onGoogleClick }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // Marca ambos campos en accent tras credenciales incorrectas, hasta que el usuario vuelva a escribir.
  const [invalid, setInvalid] = useState(false);

  // El aviso flotante desaparece solo a los 3s, o al pulsar fuera de él.
  useEffect(() => {
    if (!error) return undefined;
    const timer = setTimeout(() => setError(""), 3000);
    return () => clearTimeout(timer);
  }, [error]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");

    if (!email.trim()) {
      setError(t('auth.error_email_required'));
      setInvalid(true);
      return;
    }
    if (!password) {
      setError(t('auth.error_password_required'));
      setInvalid(true);
      return;
    }

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
      if (status === 401) setInvalid(true);
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
        <div className={`input-wrapper${invalid ? " is-invalid" : ""}`}>
          <span className="material-symbols-outlined input-icon">mail</span>
          <input
            type="email"
            id="email"
            placeholder={t('auth.email_placeholder')}
            pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
            title={t('auth.email_placeholder')}
            value={email}
            onChange={(e) => { setEmail(e.target.value); setInvalid(false); }}
          />
        </div>
      </div>

      {/* Password */}
      <div className="input-group">
        <label className="sr-only" htmlFor="password">
          {t('auth.password_label')}
        </label>
        <div className={`input-wrapper${invalid ? " is-invalid" : ""}`} style={{ position: 'relative' }}>
          <span className="material-symbols-outlined input-icon">lock</span>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            placeholder={t('auth.password_placeholder')}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setInvalid(false); }}
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

      {/* Error: ventana flotante centrada, se cierra sola o al pulsar fuera.
          Se monta en document.body porque .login-card usa backdrop-filter,
          que crea un containing block y rompe `position: fixed` si se anida ahí. */}
      {error && createPortal(
        <div className="login-error-overlay" onClick={() => setError("")}>
          <p className="login-error-toast" role="alert" onClick={(e) => e.stopPropagation()}>
            {error}
          </p>
        </div>,
        document.body,
      )}

      {/* Submit */}
      <div className="submit-group">
        <button type="submit" className="btn-primary-new" disabled={loading}>
          <span className="material-symbols-outlined">{loading ? "hourglass_top" : "login"}</span>
          {loading ? t('auth.btn_login_loading') : t('auth.btn_login')}
        </button>
      </div>

      {/* Continuar con Google (demo): resuelve el email y deja elegir el perfil debajo */}
      <div className="social-divider">
        <span className="divider-line" />
        <span className="divider-text">{t('auth.social_divider')}</span>
        <span className="divider-line" />
      </div>
      <div className="social-buttons">
        <button
          type="button"
          className="btn-social btn-google"
          disabled={loading}
          onClick={onGoogleClick}
        >
          <svg className="google-logo" viewBox="0 0 18 18" aria-hidden="true" focusable="false">
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
            <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.69 9c0-.6.1-1.18.28-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33z" />
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.59-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
          </svg>
          {t('auth.google_continue')}
        </button>
      </div>
    </form>
  );
}

export default LoginForm;
