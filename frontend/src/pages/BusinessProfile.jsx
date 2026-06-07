import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store";

const DAYS = [
  { key: "lun", label: "Lunes" },
  { key: "mar", label: "Martes" },
  { key: "mie", label: "Miércoles" },
  { key: "jue", label: "Jueves" },
  { key: "vie", label: "Viernes" },
  { key: "sab", label: "Sábado" },
  { key: "dom", label: "Domingo" },
];

const DAY_ORDER = Object.fromEntries(DAYS.map(({ key }, i) => [key, i]));

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const h = String(i).padStart(2, "0");
  return `${h}:00`;
});

const EMPTY_SLOT = { day: "", m_from: "", m_to: "", a_from: "", a_to: "", continuous: false };

function BusinessProfile() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    nif: user?.nif || "",
    address: user?.address || "",
    phone: user?.phone || "",
    description: user?.description || "",
  });

  const [scheduleList, setScheduleList] = useState(user?.scheduleList || []);
  const [slot, setSlot] = useState(EMPTY_SLOT);
  const [errors, setErrors] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);

  const handleReset = () => {
    setProfile({
      name: user?.name || "",
      email: user?.email || "",
      nif: user?.nif || "",
      address: user?.address || "",
      phone: user?.phone || "",
      description: user?.description || "",
    });
    setScheduleList(user?.scheduleList || []);
    setSlot(EMPTY_SLOT);
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateField = (name, value) => {
    if (name === "name" && !value.trim()) return "El nombre del negocio es obligatorio.";
    if (name === "nif" && !value.trim()) return "El NIF es obligatorio.";
    if (name === "address" && !value.trim()) return "La dirección es obligatoria.";
    if (name === "phone" && !value.trim()) return "El teléfono de contacto es obligatorio.";
    if (name === "email") {
      if (!value.trim()) return "El correo electrónico es obligatorio.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Introduce un correo válido.";
    }
    return "";
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validate = () => {
    const newErrors = {};
    if (!profile.name.trim()) newErrors.name = "El nombre del negocio es obligatorio.";
    if (!profile.nif.trim()) newErrors.nif = "El NIF es obligatorio.";
    if (!profile.address.trim()) newErrors.address = "La dirección es obligatoria.";
    if (!profile.phone.trim()) newErrors.phone = "El teléfono de contacto es obligatorio.";
    if (!profile.email.trim()) newErrors.email = "El correo electrónico es obligatorio.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) newErrors.email = "Introduce un correo válido.";
    return newErrors;
  };

  const handleSlotChange = (field, value) => {
    setSlot((prev) => ({ ...prev, [field]: value }));
  };

  const [scheduleError, setScheduleError] = useState("");

  const handleAddSlot = () => {
    if (!slot.day || !slot.m_from || !slot.m_to) return;

    if (slot.m_to <= slot.m_from) {
      setScheduleError("La hora de fin de mañana debe ser posterior a la de inicio.");
      return;
    }
    if (slot.a_from && slot.a_from < slot.m_to) {
      setScheduleError("El turno de tarde debe empezar después de que acabe el de mañana.");
      return;
    }
    if (slot.a_from && slot.a_to && slot.a_to <= slot.a_from) {
      setScheduleError("La hora de fin de tarde debe ser posterior a la de inicio.");
      return;
    }

    setScheduleError("");
    const updated = [...scheduleList.filter((s) => s.day !== slot.day), slot]
      .sort((a, b) => DAY_ORDER[a.day] - DAY_ORDER[b.day]);
    setScheduleList(updated);
    setSlot(EMPTY_SLOT);
  };

  const handleRemoveSlot = (day) => {
    setScheduleList((prev) => prev.filter((s) => s.day !== day));
  };

  const handleSave = (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    updateUser({ ...profile, scheduleList });
    setShowConfirm(true);
    setTimeout(() => setShowConfirm(false), 3000);
  };

  const formatSlot = (s) => {
    if (s.continuous) return `${s.m_from} – ${s.a_to} (continuo)`;
    const morning = `${s.m_from} – ${s.m_to}`;
    const afternoon = s.a_from && s.a_to ? ` / ${s.a_from} – ${s.a_to}` : "";
    return morning + afternoon;
  };

  const usedDays = new Set(scheduleList.map((s) => s.day));

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
              id="name" name="name" type="text"
              className={`biz-input${errors.name ? ' biz-input--error' : ''}`}
              placeholder="Ej: Txikipark Aventuras"
              value={profile.name} onChange={handleChange} onBlur={handleBlur}
            />
            {errors.name && <span className="biz-field-error">{errors.name}</span>}
          </div>

          <div className="create-family-form__group">
            <label className="section-label biz-label" htmlFor="nif">NIF</label>
            <input
              id="nif" name="nif" type="text"
              className={`biz-input${errors.nif ? ' biz-input--error' : ''}`}
              placeholder="Ej: B12345678"
              value={profile.nif} onChange={handleChange} onBlur={handleBlur}
            />
            {errors.nif && <span className="biz-field-error">{errors.nif}</span>}
          </div>

          <div className="create-family-form__group">
            <label className="section-label biz-label" htmlFor="description">Descripción</label>
            <textarea
              id="description" name="description" className="biz-input"
              placeholder="Ej: Ofrecemos actividades de aventura para niños de 3 a 12 años..."
              value={profile.description} onChange={handleChange}
              style={{ height: '9rem', padding: '0.75rem 1rem', resize: 'vertical' }}
            />
          </div>

          <div className="create-family-form__group">
            <label className="section-label biz-label" htmlFor="address">Dirección</label>
            <input
              id="address" name="address" type="text"
              className={`biz-input${errors.address ? ' biz-input--error' : ''}`}
              placeholder="Ej: Calle Gran Vía 12, 48001 Bilbao"
              value={profile.address} onChange={handleChange} onBlur={handleBlur}
            />
            {errors.address && <span className="biz-field-error">{errors.address}</span>}
          </div>

          <div className="create-family-form__group">
            <label className="section-label biz-label" htmlFor="phone">Teléfono de contacto</label>
            <input
              id="phone" name="phone" type="tel"
              className={`biz-input${errors.phone ? ' biz-input--error' : ''}`}
              placeholder="Ej: 944 123 456"
              value={profile.phone} onChange={handleChange} onBlur={handleBlur}
            />
            {errors.phone && <span className="biz-field-error">{errors.phone}</span>}
          </div>

          <div className="create-family-form__group">
            <label className="section-label biz-label" htmlFor="email">Correo electrónico</label>
            <input
              id="email" name="email" type="email"
              className={`biz-input${errors.email ? ' biz-input--error' : ''}`}
              placeholder="Ej: contacto@tunegocio.com"
              value={profile.email} onChange={handleChange} onBlur={handleBlur}
            />
            {errors.email && <span className="biz-field-error">{errors.email}</span>}
          </div>

          {/* ── Horario ── */}
          <div className="create-family-form__group">
            <label className="section-label biz-label">Horario</label>

            <div className="schedule-builder">
              <select
                className="biz-input schedule-select"
                value={slot.day}
                onChange={(e) => handleSlotChange("day", e.target.value)}
              >
                <option value="">Día</option>
                {DAYS.filter(({ key }) => !usedDays.has(key)).map(({ key, label }) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>

              <div className="schedule-shift">
                <span className="schedule-shift-label">De / Hasta</span>
                <div className="schedule-shift-times">
                  <select
                    className="biz-input schedule-time-select"
                    value={slot.m_from}
                    onChange={(e) => handleSlotChange("m_from", e.target.value)}
                  >
                    <option value="">Inicio</option>
                    {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                  <span className="schedule-separator">—</span>
                  <select
                    className="biz-input schedule-time-select"
                    value={slot.m_to}
                    onChange={(e) => handleSlotChange("m_to", e.target.value)}
                  >
                    <option value="">Fin</option>
                    {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>

              <label className="schedule-continuous">
                <input
                  type="checkbox"
                  checked={slot.continuous}
                  onChange={(e) => handleSlotChange("continuous", e.target.checked)}
                />
                <span>Turno continuo</span>
              </label>

              {!slot.continuous && (
                <hr className="schedule-divider" />
              )}

              {!slot.continuous && (
                <div className="schedule-shift">
                  <span className="schedule-shift-label">De / Hasta <span className="schedule-optional">(opcional)</span></span>
                  <div className="schedule-shift-times">
                    <select
                      className="biz-input schedule-time-select"
                      value={slot.a_from}
                      onChange={(e) => handleSlotChange("a_from", e.target.value)}
                    >
                      <option value="">Inicio</option>
                      {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <span className="schedule-separator">—</span>
                    <select
                      className="biz-input schedule-time-select"
                      value={slot.a_to}
                      onChange={(e) => handleSlotChange("a_to", e.target.value)}
                    >
                      <option value="">Fin</option>
                      {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {scheduleError && (
                <p className="schedule-error">{scheduleError}</p>
              )}

              <button
                type="button"
                className="btn-outline schedule-add-btn"
                onClick={handleAddSlot}
                disabled={!slot.day || !slot.m_from || !slot.m_to}
              >
                <span className="material-symbols-outlined">add</span>
                Añadir
              </button>

              {scheduleList.length > 0 && (
                <>
                  <hr className="schedule-divider" />
                  <ul className="schedule-list">
                    {scheduleList.map((s) => (
                      <li key={s.day} className="schedule-list-item">
                        <span className="schedule-list-day">
                          {DAYS.find((d) => d.key === s.day)?.label}
                        </span>
                        <span className="schedule-list-hours">{formatSlot(s)}</span>
                        <button
                          type="button"
                          className="schedule-list-remove"
                          onClick={() => handleRemoveSlot(s.day)}
                          aria-label="Eliminar"
                        >
                          <span className="material-symbols-outlined">close</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>

          <div className="create-family-form__actions">
            <button type="submit" className="btn-primary">
              <span className="material-symbols-outlined">save</span>
              Guardar cambios
            </button>
            <span className="btn-reset-wrapper">
              <button type="button" className="btn-reset" onClick={handleReset}>
                Restablecer
              </button>
            </span>
          </div>

        </form>
      </section>
      {showConfirm && (
        <div className="save-confirm-overlay" onClick={() => setShowConfirm(false)}>
          <div className="save-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <span className="material-symbols-outlined save-confirm-icon">check_circle</span>
            <p className="save-confirm-text">Cambios guardados correctamente</p>
          </div>
        </div>
      )}
    </main>
  );
}

export default BusinessProfile;
