import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store";

function BusinessProfile() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    nif: user?.nif || "",
    address: user?.address || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateUser(profile);
  };

  return (
    <main className="biz-dashboard-main">
      <div className="biz-dashboard-header">
        <h1 className="page-title">Editar perfil</h1>
        <div className="btn-back-wrapper">
          <button type="button" className="btn-text-danger" onClick={() => navigate(-1)}>
            Volver atrás
          </button>
        </div>
      </div>

      <section className="biz-activity-form">
        <form className="create-family-form" onSubmit={handleSave}>

          <div className="create-family-form__group">
            <label className="section-label biz-label" htmlFor="name">Nombre del negocio</label>
            <input
              id="name"
              name="name"
              type="text"
              className="biz-input"
              placeholder="Ej: Txikipark Aventuras"
              value={profile.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="create-family-form__group">
            <label className="section-label biz-label" htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              name="email"
              type="email"
              className="biz-input"
              placeholder="Ej: contacto@tunegocio.com"
              value={profile.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="create-family-form__group">
            <label className="section-label biz-label" htmlFor="nif">NIF</label>
            <input
              id="nif"
              name="nif"
              type="text"
              className="biz-input"
              value={profile.nif}
              onChange={handleChange}
              placeholder="Ej: B12345678"
              required
            />
          </div>

          <div className="create-family-form__group">
            <label className="section-label biz-label" htmlFor="address">Dirección</label>
            <input
              id="address"
              name="address"
              type="text"
              className="biz-input"
              placeholder="Ej: Calle Gran Vía 12, 48001 Bilbao"
              value={profile.address}
              onChange={handleChange}
            />
          </div>

          <div className="create-family-form__actions">
            <button type="submit" className="btn-primary">
              <span className="material-symbols-outlined">save</span>
              Guardar cambios
            </button>
          </div>

        </form>
      </section>
    </main>
  );
}

export default BusinessProfile;
