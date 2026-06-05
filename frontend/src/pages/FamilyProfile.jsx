import React, { useState } from "react";
import { useAuthStore, useUserStore } from "../store";

function FamilyProfile() {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const { children, addChild, removeChild } = useUserStore();
  const [preferences, setPreferences] = useState({
    carrito: true,
    cambiador: true,
    interior: false,
    presupuesto: true,
    tranquilos: false,
  });
  const [avatar, setAvatar] = useState(user?.avatar || "FA");
  const [saved, setSaved] = useState(false);

  const [showAddChildForm, setShowAddChildForm] = useState(false);
  const [newChildGender, setNewChildGender] = useState("Niño/a");
  const [newChildAge, setNewChildAge] = useState("");

  const togglePreference = (key) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAvatarEdit = () => {
    const newAvatar = window.prompt("Introduce tus iniciales", avatar);
    if (newAvatar) {
      setAvatar(newAvatar.toUpperCase().slice(0, 2));
      updateUser({ avatar: newAvatar.toUpperCase().slice(0, 2) });
    }
  };

  const handleAddChild = () => {
    setShowAddChildForm(true);
  };

  const submitChild = () => {
    if (newChildAge) {
      addChild({ type: newChildGender, age: `${newChildAge} años` });
      setShowAddChildForm(false);
      setNewChildGender("Niño/a");
      setNewChildAge("");
    }
  };

  const handleRemoveChild = (id) => {
    removeChild(id);
  };

  const handleSaveProfile = () => {
    updateUser({ preferences });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  return (
    <main className="family-profile-main">
      <section className="profile-header-section">
        <div className="avatar-wrapper">
          <div className="profile-avatar">{avatar}</div>
          <button
            className="btn-edit-avatar"
            type="button"
            onClick={handleAvatarEdit}
          >
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
          <button
            className="btn-text-primary"
            type="button"
            onClick={handleAddChild}
          >
            <span className="material-symbols-outlined text-sm">add</span>{" "}
            Añadir
          </button>
        </div>

        {showAddChildForm && (
          <div className="add-child-form" style={{ marginBottom: "1rem", padding: "1rem", backgroundColor: "var(--surface-container-lowest)", borderRadius: "8px", border: "1px solid var(--outline-variant)" }}>
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
              <div style={{ flex: 1 }}>
                <label className="section-label" style={{ fontSize: "0.875rem", marginBottom: "0.5rem", display: "block" }}>Sexo</label>
                <select 
                  value={newChildGender} 
                  onChange={(e) => setNewChildGender(e.target.value)}
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "8px", border: "1px solid var(--outline)", backgroundColor: "transparent", color: "var(--on-surface)" }}
                >
                  <option value="Niño/a">Prefiero no decirlo</option>
                  <option value="Niña">Niña</option>
                  <option value="Niño">Niño</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label className="section-label" style={{ fontSize: "0.875rem", marginBottom: "0.5rem", display: "block" }}>Edad</label>
                <input 
                  type="number" 
                  value={newChildAge} 
                  onChange={(e) => setNewChildAge(e.target.value)}
                  placeholder="Ej: 5"
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "8px", border: "1px solid var(--outline)", backgroundColor: "transparent", color: "var(--on-surface)" }}
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
              <button 
                className="btn-outline-sm" 
                type="button"
                onClick={() => setShowAddChildForm(false)}
                style={{ padding: "0.5rem 1rem" }}
              >
                Cancelar
              </button>
              <button 
                className="btn-primary-sm" 
                type="button"
                onClick={submitChild}
                style={{ padding: "0.5rem 1rem" }}
                disabled={!newChildAge}
              >
                Guardar
              </button>
            </div>
          </div>
        )}

        <div className="children-list">
          {children.map((child) => (
            <div key={child.id} className="child-item">
              <div className="child-info">
                <div className="child-icon bg-primary-light">
                  <span className="material-symbols-outlined">child_care</span>
                </div>
                <div className="child-details">
                  <p className="child-type">{child.type}</p>
                  <p className="child-age">{child.age}</p>
                </div>
              </div>
              <button
                className="btn-icon-danger"
                type="button"
                onClick={() => handleRemoveChild(child.id)}
              >
                <span className="material-symbols-outlined">delete</span>
              </button>
            </div>
          ))}
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
        <button
          className="btn-primary-full"
          type="button"
          onClick={handleSaveProfile}
        >
          Guardar perfil
        </button>
        {saved && (
          <p className="status-message">Perfil guardado correctamente.</p>
        )}
      </section>
    </main>
  );
}

export default FamilyProfile;
