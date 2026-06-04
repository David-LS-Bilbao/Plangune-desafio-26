import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../store";

function CreateFamily() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [form, setForm] = useState({
    familyName: "",
    location: "",
    members: "",
    childrenAges: "",
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
    navigate("/planes");
  };

  return (
    <main className="create-account-main">
      <section className="page-header">
        <p className="page-tag">{t('createFamily.tag', 'Registro familiar')}</p>
        <h1 className="page-title">{t('createFamily.title', 'Crea tu familia')}</h1>
        <p className="page-subtitle">
          {t('createFamily.subtitle', 'Configura tu perfil para recibir planes y recomendaciones personalizadas.')}
        </p>
      </section>

      <section className="create-card">
        <form className="create-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="familyName">
              {t('createFamily.familyName', 'Nombre de la familia')}
            </label>
            <input
              id="familyName"
              name="familyName"
              type="text"
              className="form-input"
              value={form.familyName}
              onChange={handleChange}
              placeholder="Familia Bilbao"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="location">
              {t('createFamily.location', 'Ubicación')}
            </label>
            <input
              id="location"
              name="location"
              type="text"
              className="form-input"
              value={form.location}
              onChange={handleChange}
              placeholder="Bilbao"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="members">
              {t('createFamily.members', 'Miembros en el hogar')}
            </label>
            <input
              id="members"
              name="members"
              type="number"
              className="form-input"
              value={form.members}
              onChange={handleChange}
              placeholder="4"
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="childrenAges">
              {t('createFamily.childrenAges', 'Edades de los peques')}
            </label>
            <input
              id="childrenAges"
              name="childrenAges"
              type="text"
              className="form-input"
              value={form.childrenAges}
              onChange={handleChange}
              placeholder="8 meses, 3 años"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              {t('createFamily.email', 'Correo electrónico')}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
              value={form.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              {t('createFamily.password', 'Contraseña')}
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
              {t('createFamily.submit', 'Crear familia')}
            </button>
            <button
              type="button"
              className="btn-link"
              onClick={() => navigate("/login")}
            >
              {t('createFamily.back', 'Volver al inicio')}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default CreateFamily;
