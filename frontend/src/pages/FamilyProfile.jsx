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
    carrito: false,
    cambiador: false,
    mascota: false,
    interior: false,
    presupuesto: false,
    tranquilos: false,
  });
  const [avatar, setAvatar] = useState(user?.avatar || "FA");
  const [familyName, setFamilyName] = useState(user?.familyName || "");
  const [location, setLocation] = useState(user?.location || "");
  const [members, setMembers] = useState(user?.members || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [email, setEmail] = useState(user?.email || "");
  const [saved, setSaved] = useState(false);
  const [touched, setTouched] = useState({});

  const touch = (field) => setTouched((prev) => ({ ...prev, [field]: true }));
  const isInvalid = (field, value) => touched[field] && !String(value).trim();

  const EMAIL_FORMAT_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emailError = (() => {
    if (!touched.email) return "";
    const raw = String(email).trim();
    if (!raw) return "Indica tu correo electrónico";
    if (!EMAIL_FORMAT_REGEX.test(raw)) return "El email debe tener un formato correcto";
    return "";
  })();
  const isEmailInvalid = emailError !== "";

  const membersError = (() => {
    if (!touched.members) return "";
    const raw = String(members).trim();
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
    const raw = String(phone).trim();
    if (!raw) return "Indica un teléfono de contacto";
    if (!PHONE_FORMAT_REGEX.test(raw)) return "El teléfono debe tener un formato correcto";
    return "";
  })();
  const isPhoneInvalid = phoneError !== "";

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

  const isChildAgeValid = (() => {
    if (!newChildAge) return false;
    const value = Number(newChildAge);
    return Number.isInteger(value) && value >= 0 && value <= 99;
  })();

  const submitChild = () => {
    if (isChildAgeValid) {
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
    setTouched({ familyName: true, location: true, members: true, phone: true, email: true });
    if (!familyName.trim() || !location.trim() || !members.trim() || !phone.trim() || !email.trim()) return;
    if (isMembersInvalid || isPhoneInvalid || isEmailInvalid) return;

    updateUser({ familyName, location, members, phone, email, preferences });
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

        <div className="btn-back-wrapper" style={{ alignSelf: "flex-end", paddingRight: "1.2rem", marginTop: "1rem" }}>
          <button
            type="button"
            className="btn-text-danger"
            onClick={() => { logout(); navigate('/login'); }}
          >
            Cerrar sesión
          </button>
        </div>
      </section>

      <div className="profile-form-card">
      <section className="profile-section">
        <label htmlFor="familyName" className="section-label">
          Nombre de la familia
        </label>
        <div className={`input-with-icon${isInvalid("familyName", familyName) ? " input-with-icon--error" : ""}`}>
          <span className="material-symbols-outlined icon">family_restroom</span>
          <input
            type="text"
            id="familyName"
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
            onBlur={() => touch("familyName")}
            placeholder="Ej: Familia Etxebarria"
          />
        </div>
        {isInvalid("familyName", familyName) && <span className="create-family-field-error">Ponle un nombre a tu familia</span>}
      </section>

      <section className="profile-section">
        <label htmlFor="location" className="section-label">
          Ubicación
        </label>
        <div className={`input-with-icon${isInvalid("location", location) ? " input-with-icon--error" : ""}`}>
          <span className="material-symbols-outlined icon">location_on</span>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onBlur={() => touch("location")}
            placeholder="Ej: Bilbao"
          />
        </div>
        {isInvalid("location", location) && <span className="create-family-field-error">Indica vuestra ubicación</span>}
      </section>

      <section className="profile-section">
        <label htmlFor="members" className="section-label">
          Miembros en el hogar
        </label>
        <div className={`input-with-icon${isMembersInvalid ? " input-with-icon--error" : ""}`}>
          <span className="material-symbols-outlined icon">group</span>
          <input
            type="number"
            id="members"
            min="0"
            max="99"
            value={members}
            onChange={(e) => setMembers(e.target.value)}
            onBlur={() => touch("members")}
            placeholder="Ej: 4"
          />
        </div>
        {isMembersInvalid && <span className="create-family-field-error">{membersError}</span>}
      </section>

      <section className="profile-section profile-section--children">
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
                  min="0"
                  max="99"
                  value={newChildAge}
                  onChange={(e) => setNewChildAge(e.target.value)}
                  placeholder="Ej: 5"
                />
                {newChildAge && !isChildAgeValid && (
                  <span className="create-family-field-error">La edad debe estar entre 0 y 99 años</span>
                )}
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
                disabled={!isChildAgeValid}
              >
                Guardar
              </button>
            </div>
          </div>
        )}

        {children.length === 0 && !showAddChildForm && (
          <div className="children-empty">
            <span className="material-symbols-outlined">child_care</span>
            <p>Pulsa en "Añadir" para registrar a los peques de tu familia.</p>
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
        <label htmlFor="phone" className="section-label">
          Teléfono
        </label>
        <div className={`input-with-icon${isPhoneInvalid ? " input-with-icon--error" : ""}`}>
          <span className="material-symbols-outlined icon">phone</span>
          <input
            type="text"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onBlur={() => touch("phone")}
            placeholder="Ej: 600 123 456"
          />
        </div>
        {isPhoneInvalid && <span className="create-family-field-error">{phoneError}</span>}
      </section>

      <section className="profile-section">
        <label htmlFor="email" className="section-label">
          Correo electrónico
        </label>
        <div className={`input-with-icon${isEmailInvalid ? " input-with-icon--error" : ""}`}>
          <span className="material-symbols-outlined icon">mail</span>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => touch("email")}
            placeholder="Ej: familia@ejemplo.com"
          />
        </div>
        {isEmailInvalid && <span className="create-family-field-error">{emailError}</span>}
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
