import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../store";
import NavbarResponsive from "../components/common/NavbarResponsive";

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
    <>
      <NavbarResponsive />
      <main className="create-family-main">
        <div className="create-family-card">

          <div className="create-family-header">
            <h1 className="create-family-title">Crea tu negocio</h1>
            <p className="create-family-subtitle">
              Configura tu perfil comercial y comienza a publicar tus ofertas.
            </p>
          </div>

          <form className="create-family-form" onSubmit={handleSubmit}>

            <div className="create-family-form__group">
              <label className="section-label" htmlFor="businessName">Nombre del negocio</label>
              <div className="input-with-icon">
                <span className="material-symbols-outlined icon">storefront</span>
                <input id="businessName" name="businessName" type="text" value={form.businessName} onChange={handleChange} placeholder="TxikiNegocio" required />
              </div>
            </div>

            <div className="create-family-form__group">
              <label className="section-label" htmlFor="category">Categoría</label>
              <div className="input-with-icon">
                <span className="material-symbols-outlined icon">category</span>
                <input id="category" name="category" type="text" value={form.category} onChange={handleChange} placeholder="Turismo, Alimentación, Ocio" />
              </div>
            </div>

            <div className="create-family-form__group">
              <label className="section-label" htmlFor="address">Dirección</label>
              <div className="input-with-icon">
                <span className="material-symbols-outlined icon">location_on</span>
                <input id="address" name="address" type="text" value={form.address} onChange={handleChange} placeholder="Calle Mayor 12" />
              </div>
            </div>

            <div className="create-family-form__group">
              <label className="section-label" htmlFor="nif">NIF</label>
              <div className="input-with-icon">
                <span className="material-symbols-outlined icon">badge</span>
                <input id="nif" name="nif" type="text" value={form.nif} onChange={handleChange} placeholder="A12345678" required />
              </div>
            </div>

            <div className="create-family-form__group">
              <label className="section-label" htmlFor="phone">Teléfono</label>
              <div className="input-with-icon">
                <span className="material-symbols-outlined icon">phone</span>
                <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+34 600 123 456" />
              </div>
            </div>

            <div className="create-family-form__group">
              <label className="section-label" htmlFor="email">Correo electrónico</label>
              <div className="input-with-icon">
                <span className="material-symbols-outlined icon">mail</span>
                <input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="negocio@txikiplan.com" required />
              </div>
            </div>

            <div className="create-family-form__group">
              <label className="section-label" htmlFor="password">Contraseña</label>
              <div className="input-with-icon">
                <span className="material-symbols-outlined icon">lock</span>
                <input id="password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" required />
              </div>
            </div>

            <div className="create-family-form__actions">
              <button type="submit" className="btn-primary">
                <span className="material-symbols-outlined">add_business</span>
                Crear negocio
              </button>
              <button type="button" className="btn-text-danger" onClick={() => navigate("/login")}>
                Volver al inicio
              </button>
            </div>

          </form>
        </div>
      </main>
    </>
  );
}

export default CreateBusiness;
