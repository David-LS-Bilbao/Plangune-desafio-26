import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore, useUserStore } from "../store";

function FamilyProfile() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const updateUser = useAuthStore((state) => state.updateUser);
  const { children, addChild, removeChild } = useUserStore();
  const [preferences, setPreferences] = useState({
    carrito: true,
    cambiador: true,
    mascota: false,
    interior: false,
    presupuesto: true,
    tranquilos: false,
  });
  const [avatar, setAvatar] = useState(user?.avatar || "FA");
  const [saved, setSaved] = useState(false);

  const [showAddChildForm, setShowAddChildForm] = useState(false);
  const [newChildGender, setNewChildGender] = useState("Sin especificar");
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
      setNewChildGender("Sin especificar");
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
          ¡Hola {user?.name || "Familia"}! Si personalizas el perfil, 
          podremos recomendarte los mejores planes para tu familia.
        </p>

        <button
          type="button"
          className="btn-text-danger"
          onClick={() => { logout(); navigate('/login'); }}
        >
          Cerrar sesión
        </button>
      </section>

      <div className="profile-form-card">
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
          <div className="add-child-form">
            <div className="add-child-fields">
              <div className="add-child-field">
                <label className="section-label">Sexo</label>
                <div className="gender-selector">
                  {[
                    { value: "Sin especificar", label: "Sin especificar" },
                    { value: "Niña", label: "Niña" },
                    { value: "Niño", label: "Niño" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`gender-pill${newChildGender === opt.value ? " active" : ""}`}
                      onClick={() => setNewChildGender(opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="add-child-field">
                <label className="section-label">Edad</label>
                <input
                  className="child-input"
                  type="number"
                  value={newChildAge}
                  onChange={(e) => setNewChildAge(e.target.value)}
                  placeholder="Ej: 5"
                />
              </div>
            </div>
            <div className="add-child-actions">
              <button
                className="btn-child-cancel"
                type="button"
                onClick={() => setShowAddChildForm(false)}
              >
                Cancelar
              </button>
              <button
                className="btn-child-save"
                type="button"
                onClick={submitChild}
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
                <div className="child-icon">
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
                pets
              </span>
              <span className="preference-text">Con mascota</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={preferences.mascota}
                onChange={() => togglePreference("mascota")}
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
      </div>
    </main>
  );
}

export default FamilyProfile;
