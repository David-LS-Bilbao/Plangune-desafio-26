import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../store";
import NavbarResponsive from "../components/common/NavbarResponsive";

function CreateFamily() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const registerAccount = useAuthStore((state) => state.register);
  const updateUser = useAuthStore((state) => state.updateUser);
  const [form, setForm] = useState({
    familyName: "",
    location: "",
    members: "",
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

  const membersError = (() => {
    if (!touched.members) return "";
    const raw = String(form.members).trim();
    if (!raw) return "Indica cuántos sois en el hogar";
    const value = Number(raw);
    if (value < 0) return "El número de miembros no puede ser negativo";
    if (raw.replace("-", "").length > 2) return "El número de miembros debe tener como máximo dos dígitos";
    return "";
  })();
  const isMembersInvalid = membersError !== "";

  const PHONE_FORMAT_REGEX = /^[+\d][\d\s]{8,}$/;
  const phoneError = (() => {
    if (!touched.phone) return "";
    const raw = String(form.phone).trim();
    if (!raw) return "Indica un teléfono de contacto";
    if (!PHONE_FORMAT_REGEX.test(raw)) return "El teléfono debe tener un formato correcto";
    return "";
  })();
  const isPhoneInvalid = phoneError !== "";

  const isConfirmPasswordInvalid =
    touched.confirmPassword &&
    (!form.confirmPassword.trim() || form.confirmPassword !== form.password);

  // Registro real (rol family). Los datos extra (nombre familia, ubicación, miembros, teléfono)
  // aún no se persisten en backend en esta fase: se guardan en cliente con updateUser, igual
  // que el resto del perfil (avatar, preferencias), para que aparezcan ya rellenos al editar.
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setTouched({ familyName: true, location: true, members: true, phone: true, email: true, password: true, confirmPassword: true });
    if (Object.keys(form).some((field) => !String(form[field]).trim())) return;
    if (!PHONE_FORMAT_REGEX.test(form.phone.trim())) return;
    if (isEmailFormatInvalid(form.email)) return;
    if (form.confirmPassword !== form.password) return;
    setError("");
    setLoading(true);
    try {
      await registerAccount({ email: form.email, password: form.password, role: "family" });
      updateUser({ familyName: form.familyName, location: form.location, members: form.members, phone: form.phone });
      navigate("/", { replace: true });
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
            <div className={`input-with-icon${isInvalid("familyName") ? " input-with-icon--error" : ""}`}>
              <span className="material-symbols-outlined icon">family_restroom</span>
              <input id="familyName" name="familyName" type="text" value={form.familyName} onChange={handleChange} onBlur={() => touch("familyName")} placeholder={t('onboarding.family_name_placeholder')} required />
            </div>
            {isInvalid("familyName") && <span className="create-family-field-error">Ponle un nombre a tu familia</span>}
          </div>

          <div className="create-family-form__group">
            <label className="section-label" htmlFor="location">{t('onboarding.location')}</label>
            <div className={`input-with-icon${isInvalid("location") ? " input-with-icon--error" : ""}`}>
              <span className="material-symbols-outlined icon">location_on</span>
              <input id="location" name="location" type="text" value={form.location} onChange={handleChange} onBlur={() => touch("location")} placeholder={t('onboarding.location_placeholder')} required />
            </div>
            {isInvalid("location") && <span className="create-family-field-error">Indica vuestra ubicación</span>}
          </div>

          <div className="create-family-form__group">
            <label className="section-label" htmlFor="members">{t('onboarding.members')}</label>
            <div className={`input-with-icon${isMembersInvalid ? " input-with-icon--error" : ""}`}>
              <span className="material-symbols-outlined icon">group</span>
              <input id="members" name="members" type="number" value={form.members} onChange={handleChange} onBlur={() => touch("members")} placeholder="Ej: 4" min="0" max="99" required />
            </div>
            {isMembersInvalid && <span className="create-family-field-error">{membersError}</span>}
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
              <span className="material-symbols-outlined">{loading ? "hourglass_top" : "family_restroom"}</span>
              {loading ? t('onboarding.btn_creating') : t('onboarding.btn_create_family')}
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

export default CreateFamily;
