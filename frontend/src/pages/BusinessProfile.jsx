import React, { useState } from "react";
import { useAuthStore } from "../store";

function BusinessProfile() {
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
    <main className="business-profile-main">
      <section className="page-header">
        <p className="page-tag">Perfil de negocio</p>
        <h1 className="page-title">Editar datos de tu empresa</h1>
        <p className="page-subtitle">
          Mantén tu perfil actualizado para que las familias te identifiquen con
          confianza.
        </p>
      </section>

      <section className="create-card">
        <form className="create-form" onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Nombre del negocio
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="form-input"
              value={profile.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
              value={profile.email}
              onChange={handleChange}
              required
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
              value={profile.nif}
              onChange={handleChange}
              placeholder="A12345678"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="address">
              Dirección
            </label>
            <input
              id="address"
              name="address"
              type="text"
              className="form-input"
              value={profile.address}
              onChange={handleChange}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary-full">
              Guardar cambios
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default BusinessProfile;
