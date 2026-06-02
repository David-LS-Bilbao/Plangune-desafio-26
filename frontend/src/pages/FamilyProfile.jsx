import React, { useState } from "react";
import { useAuthStore } from "../store";

function FamilyProfile() {
  const user = useAuthStore((state) => state.user);
  const [preferences, setPreferences] = useState({
    carrito: true,
    cambiador: true,
    interior: false,
    presupuesto: true,
    tranquilos: false,
  });

  const togglePreference = (key) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <main className="family-profile-main">
      <section className="profile-header-section">
        <div className="avatar-wrapper">
          <div className="profile-avatar">{user?.avatar || "FA"}</div>
          <button className="btn-edit-avatar" type="button">
            <span className="material-symbols-outlined text-sm">edit</span>
          </button>
        </div>

        <p className="profile-description">
          ¡Hola {user?.name || "Familia"}! Personaliza tu perfil para que
          podamos recomendarte los mejores planes para tu familia.
        </p>
      </section>

      <section className="profile-section">
        <label htmlFor="location" className="section-label">
          Ubicación habitual
        </label>
        <div className="input-with-icon">
          <span className="material-symbols-outlined icon">location_on</span>
          <input
            type="text"
            id="location"
            defaultValue="Bilbao"
            placeholder="Ciudad o código postal"
          />
        </div>
      </section>

      <section className="profile-section">
        <div className="section-header">
          <h2 className="section-label mb-0">Edades de los peques</h2>
          <button className="btn-text-primary" type="button">
            <span className="material-symbols-outlined text-sm">add</span>{" "}
            Añadir
          </button>
        </div>

        <div className="children-list">
          <div className="child-item">
            <div className="child-info">
              <div className="child-icon bg-primary-light">
                <span className="material-symbols-outlined">child_care</span>
              </div>
              <div className="child-details">
                <p className="child-type">Bebé</p>
                <p className="child-age">8 meses</p>
              </div>
            </div>
            <button className="btn-icon-danger" type="button">
              <span className="material-symbols-outlined">delete</span>
            </button>
          </div>

          <div className="child-item">
            <div className="child-info">
              <div className="child-icon bg-secondary-light">
                <span className="material-symbols-outlined">face</span>
              </div>
              <div className="child-details">
                <p className="child-type">Niño/a</p>
                <p className="child-age">3 años</p>
              </div>
            </div>
            <button className="btn-icon-danger" type="button">
              <span className="material-symbols-outlined">delete</span>
            </button>
          </div>
        </div>
      </section>

      <section className="profile-section">
        <h2 className="section-label">Preferencias de planes</h2>
        <div className="preferences-list">
          <div className="preference-item">
            <div className="preference-info">
              <span className="material-symbols-outlined text-primary">
                stroller
              </span>
              <span className="preference-text">Uso de carrito</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={preferences.carrito}
                onChange={() => togglePreference("carrito")}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="preference-item">
            <div className="preference-info">
              <span className="material-symbols-outlined text-primary">
                baby_changing_station
              </span>
              <span className="preference-text">Necesidad de cambiador</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={preferences.cambiador}
                onChange={() => togglePreference("cambiador")}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="preference-item">
            <div className="preference-info">
              <span className="material-symbols-outlined text-primary">
                roofing
              </span>
              <span className="preference-text">Planes de interior</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={preferences.interior}
                onChange={() => togglePreference("interior")}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="preference-item">
            <div className="preference-info">
              <span className="material-symbols-outlined text-primary">
                savings
              </span>
              <span className="preference-text">Bajo presupuesto</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={preferences.presupuesto}
                onChange={() => togglePreference("presupuesto")}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="preference-item border-none">
            <div className="preference-info">
              <span className="material-symbols-outlined text-primary">
                self_improvement
              </span>
              <span className="preference-text">Planes tranquilos</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={preferences.tranquilos}
                onChange={() => togglePreference("tranquilos")}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </section>

      <section className="profile-actions">
        <button className="btn-primary-full" type="button">
          Guardar perfil
        </button>
      </section>
    </main>
  );
}

export default FamilyProfile;
