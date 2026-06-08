import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../store";
import NavbarResponsive from "../components/common/NavbarResponsive";

function CreateBusiness() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const registerAccount = useAuthStore((state) => state.register);
  const [form, setForm] = useState({
    businessName: "",
    category: "",
    address: "",
    nif: "",
    phone: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Registro real (rol business). Los datos del negocio (nombre, NIF, dirección) aún no se
  // persisten en backend en esta fase: solo se crea la cuenta de usuario.
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      await registerAccount({ email: form.email, password: form.password, role: "business" });
      navigate("/negocio", { replace: true });
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
            <h1 className="create-family-title">{t('onboarding.business_title')}</h1>
            <p className="create-family-subtitle">
              {t('onboarding.business_subtitle')}
            </p>
          </div>

          <form className="create-family-form" onSubmit={handleSubmit}>

            <div className="create-family-form__group">
              <label className="section-label" htmlFor="businessName">{t('onboarding.business_name')}</label>
              <div className="input-with-icon">
                <span className="material-symbols-outlined icon">storefront</span>
                <input id="businessName" name="businessName" type="text" value={form.businessName} onChange={handleChange} placeholder={t('onboarding.business_name_placeholder')} required />
              </div>
            </div>

            <div className="create-family-form__group">
              <label className="section-label" htmlFor="category">{t('onboarding.category')}</label>
              <div className="input-with-icon">
                <span className="material-symbols-outlined icon">category</span>
                <input id="category" name="category" type="text" value={form.category} onChange={handleChange} placeholder={t('onboarding.category_placeholder')} />
              </div>
            </div>

            <div className="create-family-form__group">
              <label className="section-label" htmlFor="address">{t('onboarding.address')}</label>
              <div className="input-with-icon">
                <span className="material-symbols-outlined icon">location_on</span>
                <input id="address" name="address" type="text" value={form.address} onChange={handleChange} placeholder={t('onboarding.address_placeholder')} />
              </div>
            </div>

            <div className="create-family-form__group">
              <label className="section-label" htmlFor="nif">{t('onboarding.nif')}</label>
              <div className="input-with-icon">
                <span className="material-symbols-outlined icon">badge</span>
                <input id="nif" name="nif" type="text" value={form.nif} onChange={handleChange} placeholder="A12345678" required />
              </div>
            </div>

            <div className="create-family-form__group">
              <label className="section-label" htmlFor="phone">{t('onboarding.phone')}</label>
              <div className="input-with-icon">
                <span className="material-symbols-outlined icon">phone</span>
                <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+34 600 123 456" />
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
                <span className="material-symbols-outlined">{loading ? "hourglass_top" : "add_business"}</span>
                {loading ? t('onboarding.btn_creating') : t('onboarding.business_title')}
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

export default CreateBusiness;
