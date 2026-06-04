import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../store";

function CreateBusiness() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [form, setForm] = useState({
    businessName: "",
    category: "",
    address: "",
    nif: "",
    phone: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    login({
      role: "business",
      id: `biz_${Date.now()}`,
      name: form.businessName || "Negocio Txiki",
      email: form.email,
      nif: form.nif,
      address: form.address,
      avatar: "TP",
    });
    navigate("/negocio/dashboard");
  };

  return (
    <main className="create-account-main">
      <section className="page-header">
        <p className="page-tag">{t('createBusiness.tag', 'Registro de negocio')}</p>
        <h1 className="page-title">{t('createBusiness.title', 'Crea tu negocio')}</h1>
        <p className="page-subtitle">
          {t('createBusiness.subtitle', 'Configura tu perfil comercial y comienza a publicar tus ofertas.')}
        </p>
      </section>

      <section className="create-card">
        <form className="create-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="businessName">
              {t('createBusiness.businessName', 'Nombre del negocio')}
            </label>
            <input
              id="businessName"
              name="businessName"
              type="text"
              className="form-input"
              value={form.businessName}
              onChange={handleChange}
              placeholder="TxikiNegocio"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="category">
              {t('createBusiness.category', 'Categoría')}
            </label>
            <input
              id="category"
              name="category"
              type="text"
              className="form-input"
              value={form.category}
              onChange={handleChange}
              placeholder="Turismo, Alimentación, Ocio"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="address">
              {t('createBusiness.address', 'Dirección')}
            </label>
            <input
              id="address"
              name="address"
              type="text"
              className="form-input"
              value={form.address}
              onChange={handleChange}
              placeholder="Calle Mayor 12"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="nif">
              NIF
            </label>
            <input
              id="nif"
              name="nif"
              type="text"
              className="form-input"
              value={form.nif}
              onChange={handleChange}
              placeholder="A12345678"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="phone">
              {t('createBusiness.phone', 'Teléfono')}
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className="form-input"
              value={form.phone}
              onChange={handleChange}
              placeholder="+34 600 123 456"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              {t('createBusiness.email', 'Correo electrónico')}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
              value={form.email}
              onChange={handleChange}
              placeholder="negocio@txikiplan.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              {t('createBusiness.password', 'Contraseña')}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary-full">
              {t('createBusiness.submit', 'Crear negocio')}
            </button>
            <button
              type="button"
              className="btn-link"
              onClick={() => navigate("/login")}
            >
              {t('createBusiness.back', 'Volver al inicio')}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default CreateBusiness;
