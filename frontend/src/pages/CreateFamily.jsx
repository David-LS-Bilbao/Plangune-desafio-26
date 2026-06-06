import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store";
import NavbarResponsive from "../components/common/NavbarResponsive";

function CreateFamily() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [form, setForm] = useState({
    familyName: "",
    location: "",
    members: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    login("family");
    navigate("/perfil");
  };

  return (
    <>
    <NavbarResponsive />
    <main className="create-family-main">
      <div className="create-family-card">

        <div className="create-family-header">
          <h1 className="create-family-title">Crea tu familia</h1>
          <p className="create-family-subtitle">
            Configura tu perfil para recibir planes y recomendaciones personalizadas.
          </p>
        </div>

        <form className="create-family-form" onSubmit={handleSubmit}>

          <div className="create-family-form__group">
            <label className="section-label" htmlFor="familyName">Nombre de la familia</label>
            <div className="input-with-icon">
              <span className="material-symbols-outlined icon">family_restroom</span>
              <input id="familyName" name="familyName" type="text" value={form.familyName} onChange={handleChange} placeholder="Familia Bilbao" required />
            </div>
          </div>

          <div className="create-family-form__group">
            <label className="section-label" htmlFor="location">Ubicación</label>
            <div className="input-with-icon">
              <span className="material-symbols-outlined icon">location_on</span>
              <input id="location" name="location" type="text" value={form.location} onChange={handleChange} placeholder="Bilbao" required />
            </div>
          </div>

          <div className="create-family-form__group">
            <label className="section-label" htmlFor="members">Miembros en el hogar</label>
            <div className="input-with-icon">
              <span className="material-symbols-outlined icon">group</span>
              <input id="members" name="members" type="number" value={form.members} onChange={handleChange} placeholder="4" min="1" required />
            </div>
          </div>

<div className="create-family-form__group">
            <label className="section-label" htmlFor="email">Correo electrónico</label>
            <div className="input-with-icon">
              <span className="material-symbols-outlined icon">mail</span>
              <input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="tu@email.com" required />
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
              <span className="material-symbols-outlined">family_restroom</span>
              Crear familia
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

export default CreateFamily;
