import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../store";
import NavbarResponsive from "../components/common/NavbarResponsive";

function CreateBusiness() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const registerAccount = useAuthStore((state) => state.register);
  const updateUser = useAuthStore((state) => state.updateUser);
  const [form, setForm] = useState({
    businessName: "",
    category: "",
    address: "",
    nif: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const touch = (field) => setTouched((prev) => ({ ...prev, [field]: true }));
  const isInvalid = (field) => touched[field] && !String(form[field]).trim();

  // DNI: 8 dígitos + letra (12345678A) · NIE: X/Y/Z + 7 dígitos + letra (X1234567L) · CIF: letra + 8 dígitos (B80000000)
  const NIF_FORMAT_REGEX = /^(?:\d{8}[A-Za-z]|[XYZxyz]\d{7}[A-Za-z]|[A-Za-z]\d{8})$/;
  const nifError = (() => {
    if (!touched.nif) return "";
    const raw = String(form.nif).trim();
    if (!raw) return "Indica el NIF del negocio";
    if (!NIF_FORMAT_REGEX.test(raw)) return "El NIF debe tener un formato correcto";
    return "";
  })();
  const isNifInvalid = nifError !== "";

  const PHONE_FORMAT_REGEX = /^[+\d][\d\s]{8,}$/;
  const phoneError = (() => {
    if (!touched.phone) return "";
    const raw = String(form.phone).trim();
    if (!raw) return "Indica un teléfono de contacto";
    if (!PHONE_FORMAT_REGEX.test(raw)) return "El teléfono debe tener un formato correcto";
    return "";
  })();
  const isPhoneInvalid = phoneError !== "";

  const EMAIL_FORMAT_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailFormatInvalid = (value) => {
    const raw = String(value).trim();
    return raw !== "" && !EMAIL_FORMAT_REGEX.test(raw);
  };
  const emailError = (() => {
    if (!touched.email) return "";
    const raw = String(form.email).trim();
    if (!raw) return "Indica tu correo electrónico";
    if (!EMAIL_FORMAT_REGEX.test(raw)) return "El email debe tener un formato correcto";
    return "";
  })();
  const isEmailInvalid = emailError !== "";

  const isConfirmPasswordInvalid =
    touched.confirmPassword &&
    (!form.confirmPassword.trim() || form.confirmPassword !== form.password);

  const requiredFields = ["businessName", "address", "nif", "phone", "email", "password", "confirmPassword"];

  // Registro real (rol business). Los datos del negocio (nombre, NIF, dirección) aún no se
  // persisten en backend en esta fase: solo se crea la cuenta de usuario.
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setTouched({ businessName: true, address: true, nif: true, phone: true, email: true, password: true, confirmPassword: true });
    if (requiredFields.some((field) => !String(form[field]).trim())) return;
    if (isNifInvalid || !NIF_FORMAT_REGEX.test(form.nif.trim())) return;
    if (!PHONE_FORMAT_REGEX.test(form.phone.trim())) return;
    if (isEmailFormatInvalid(form.email)) return;
    if (form.confirmPassword !== form.password) return;
    setError("");
    setLoading(true);
    try {
      await registerAccount({ email: form.email, password: form.password, role: "business" });
      updateUser({
        name: form.businessName.trim(),
        category: form.category.trim(),
        address: form.address.trim(),
        nif: form.nif.trim(),
        phone: form.phone.trim(),
      });
      navigate("/negocio/dashboard", { replace: true });
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
              <div className={`input-with-icon${isInvalid("businessName") ? " input-with-icon--error" : ""}`}>
                <span className="material-symbols-outlined icon">storefront</span>
                <input id="businessName" name="businessName" type="text" value={form.businessName} onChange={handleChange} onBlur={() => touch("businessName")} placeholder={t('onboarding.business_name_placeholder')} required />
              </div>
              {isInvalid("businessName") && <span className="create-family-field-error">Ponle un nombre a tu negocio</span>}
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
              <div className={`input-with-icon${isInvalid("address") ? " input-with-icon--error" : ""}`}>
                <span className="material-symbols-outlined icon">location_on</span>
                <input id="address" name="address" type="text" value={form.address} onChange={handleChange} onBlur={() => touch("address")} placeholder={t('onboarding.address_placeholder')} required />
              </div>
              {isInvalid("address") && <span className="create-family-field-error">Indica la dirección del negocio</span>}
            </div>

            <div className="create-family-form__group">
              <label className="section-label" htmlFor="nif">{t('onboarding.nif')}</label>
              <div className={`input-with-icon${isNifInvalid ? " input-with-icon--error" : ""}`}>
                <span className="material-symbols-outlined icon">badge</span>
                <input id="nif" name="nif" type="text" value={form.nif} onChange={handleChange} onBlur={() => touch("nif")} placeholder="Ej: 12345678A / B80000000" required />
              </div>
              {isNifInvalid && <span className="create-family-field-error">{nifError}</span>}
            </div>

            <div className="create-family-form__group">
              <label className="section-label" htmlFor="phone">{t('onboarding.phone')}</label>
              <div className={`input-with-icon${isPhoneInvalid ? " input-with-icon--error" : ""}`}>
                <span className="material-symbols-outlined icon">phone</span>
                <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} onBlur={() => touch("phone")} placeholder="Ej: 600 123 456" required />
              </div>
              {isPhoneInvalid && <span className="create-family-field-error">{phoneError}</span>}
            </div>

            <div className="create-family-form__group">
              <label className="section-label" htmlFor="email">{t('auth.email_label')}</label>
              <div className={`input-with-icon${isEmailInvalid ? " input-with-icon--error" : ""}`}>
                <span className="material-symbols-outlined icon">mail</span>
                <input id="email" name="email" type="email" value={form.email} onChange={handleChange} onBlur={() => touch("email")} placeholder={t('auth.email_placeholder')} required />
              </div>
              {isEmailInvalid && <span className="create-family-field-error">{emailError}</span>}
            </div>

            <div className="create-family-form__group">
              <label className="section-label" htmlFor="password">{t('auth.password_label')}</label>
              <div className={`input-with-icon${isInvalid("password") ? " input-with-icon--error" : ""}`}>
                <span className="material-symbols-outlined icon">lock</span>
                <input id="password" name="password" type="password" value={form.password} onChange={handleChange} onBlur={() => touch("password")} placeholder={t('onboarding.password_placeholder')} minLength={8} required />
              </div>
              {isInvalid("password") && <span className="create-family-field-error">Indica una contraseña (mínimo 8 caracteres)</span>}
            </div>

            <div className="create-family-form__group">
              <label className="section-label" htmlFor="confirmPassword">Repetir contraseña</label>
              <div className={`input-with-icon${isConfirmPasswordInvalid ? " input-with-icon--error" : ""}`}>
                <span className="material-symbols-outlined icon">lock</span>
                <input id="confirmPassword" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} onBlur={() => touch("confirmPassword")} placeholder="Repite la contraseña" minLength={8} required />
              </div>
              {isConfirmPasswordInvalid && (
                <span className="create-family-field-error">
                  {form.confirmPassword.trim() ? "Las contraseñas deben coincidir" : "Repite la contraseña"}
                </span>
              )}
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
              <div className="btn-back-wrapper create-family-back-wrapper">
                <button type="button" className="btn-text-danger" onClick={() => navigate("/login")}>
                  {t('onboarding.btn_back_home')}
                </button>
              </div>
            </div>

          </form>
        </div>
      </main>
    </>
  );
}

export default CreateBusiness;
