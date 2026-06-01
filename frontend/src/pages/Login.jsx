import React from 'react';
import LoginForm from '../components/auth/LoginForm';

function Login() {
  return (
    <div className="login-wrapper">
      <div className="login-background" />
      <div className="login-overlay" />

      <div className="login-main-new">
        <div className="login-card-new">
          {/* Brand Header */}
          <div className="brand-header">
            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--primary)' }}>family_restroom</span>
            <h1 className="brand-title">TxikiPlan</h1>
            <p className="brand-subtitle">Encuentra los mejores planes para disfrutar en familia</p>
          </div>

          <h2 className="login-title">Bienvenido de nuevo</h2>

          <LoginForm />

          {/* Social Divider */}
          <div className="social-divider">
            <div className="divider-line"></div>
            <span className="divider-text">o continuar con</span>
            <div className="divider-line"></div>
          </div>

          {/* Social Buttons */}
          <div className="social-buttons">
            <button className="btn-social">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="social-icon" />
              <span>Google</span>
            </button>
          </div>

          {/* Register */}
          <div className="registration-section">
            <p className="registration-text">¿No tienes cuenta? Elige tu perfil:</p>
            <div className="role-grid">
              <label className="role-label">
                <input type="radio" name="register-role" value="family" className="sr-only" />
                <div className="role-card">
                  <span className="material-symbols-outlined role-icon-primary">family_restroom</span>
                  <span className="role-title">Familia</span>
                  <div className="check-icon">
                    <span className="material-symbols-outlined fill">check_circle</span>
                  </div>
                </div>
              </label>
              <label className="role-label">
                <input type="radio" name="register-role" value="business" className="sr-only" />
                <div className="role-card">
                  <span className="material-symbols-outlined role-icon-secondary">storefront</span>
                  <span className="role-title">Negocio</span>
                  <div className="check-icon">
                    <span className="material-symbols-outlined fill">check_circle</span>
                  </div>
                </div>
              </label>
            </div>
            <div className="continue-action">
              <button className="btn-link">Registrarse →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

