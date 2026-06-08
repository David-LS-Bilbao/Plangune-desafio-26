import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../store";
import NavbarResponsive from "../components/common/NavbarResponsive";

function CreateFamily() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const registerAccount = useAuthStore((state) => state.register);
  const [form, setForm] = useState({
    familyName: "",
    location: "",
    members: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Registro real (rol family). Los datos extra (nombre familia, miembros) aún no se
  // persisten en backend en esta fase: solo se crea la cuenta de usuario.
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      await registerAccount({ email: form.email, password: form.password, role: "family" });
      navigate("/buscar", { replace: true });
    } catch (err) {
      const status = err?.response?.status;
      setError(
        status === 409
          ? t('auth.error_register_exists')
          : status === 422
            ? t('auth.error_register_invalid')
            : t('auth.error_register_default'),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <NavbarResponsive />
    <main className="create-family-main">
      <div className="create-family-card">

        <div className="create-family-header">
          <h1 className="create-family-title">{t('onboarding.family_title')}</h1>
          <p className="create-family-subtitle">
            {t('onboarding.family_subtitle')}
          </p>
        </div>

        <form className="create-family-form" onSubmit={handleSubmit}>

          <div className="create-family-form__group">
            <label className="section-label" htmlFor="familyName">{t('onboarding.family_name')}</label>
            <div className="input-with-icon">
              <span className="material-symbols-outlined icon">family_restroom</span>
              <input id="familyName" name="familyName" type="text" value={form.familyName} onChange={handleChange} placeholder={t('onboarding.family_name_placeholder')} required />
            </div>
          </div>

          <div className="create-family-form__group">
            <label className="section-label" htmlFor="location">{t('onboarding.location')}</label>
            <div className="input-with-icon">
              <span className="material-symbols-outlined icon">location_on</span>
              <input id="location" name="location" type="text" value={form.location} onChange={handleChange} placeholder={t('onboarding.location_placeholder')} required />
            </div>
          </div>

          <div className="create-family-form__group">
            <label className="section-label" htmlFor="members">{t('onboarding.members')}</label>
            <div className="input-with-icon">
              <span className="material-symbols-outlined icon">group</span>
              <input id="members" name="members" type="number" value={form.members} onChange={handleChange} placeholder="4" min="1" required />
            </div>
          </div>

<div className="create-family-form__group">
            <label className="section-label" htmlFor="email">{t('auth.email_label')}</label>
            <div className="input-with-icon">
              <span className="material-symbols-outlined icon">mail</span>
              <input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder={t('auth.email_placeholder')} required />
            </div>
          </div>

          <div className="create-family-form__group">
            <label className="section-label" htmlFor="password">{t('auth.password_label')}</label>
            <div className="input-with-icon">
              <span className="material-symbols-outlined icon">lock</span>
              <input id="password" name="password" type="password" value={form.password} onChange={handleChange} placeholder={t('onboarding.password_placeholder')} minLength={8} required />
            </div>
          </div>

          {error && (
            <p role="alert" style={{ color: "var(--error-color, #d62828)", margin: "0.25rem 0 0", fontSize: "0.9rem" }}>
              {error}
            </p>
          )}

          <div className="create-family-form__actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              <span className="material-symbols-outlined">{loading ? "hourglass_top" : "family_restroom"}</span>
              {loading ? t('onboarding.btn_creating') : t('onboarding.btn_create_family')}
            </button>
            <button type="button" className="btn-text-danger" onClick={() => navigate("/login")}>
              {t('onboarding.btn_back_home')}
            </button>
          </div>

        </form>
      </div>
    </main>
    </>
  );
}

export default CreateFamily;
