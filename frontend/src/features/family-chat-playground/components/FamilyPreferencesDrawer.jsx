import React, { useEffect, useState } from "react";

const AGE_OPTIONS = ["0-2 años", "3-5 años", "6-10 años", "11+"];
const DURATION_OPTIONS = [
  { value: "", label: "Sin preferencia" },
  { value: "1h", label: "Hasta 1 hora" },
  { value: "2h", label: "Hasta 2 horas" },
  { value: "halfday", label: "Media jornada" },
  { value: "fullday", label: "Día completo" },
];

const EMPTY_DRAFT = {
  childrenAges: [],
  municipality: "",
  strollerFriendly: false,
  changingTable: false,
  rainSuitable: false,
  wheelchairAccessible: false,
  petsAllowed: false,
  maxDuration: "",
  freeOrLowCost: false,
};

/**
 * Drawer lateral de preferencias familiares (overlay mobile-first).
 *
 * Mantiene un borrador local que se inicializa con `value` cada vez que se
 * abre y se entrega al padre mediante `onApply`. Accesible: cierre con botón
 * y con backdrop.
 *
 * @param {Object} props
 * @param {boolean} props.open - Si el drawer está visible.
 * @param {Object} props.value - Preferencias actuales (fuente de verdad del padre).
 * @param {(prefs: Object) => void} props.onApply - Devuelve el borrador aplicado.
 * @param {() => void} props.onClose - Cierra el drawer sin aplicar.
 */
function FamilyPreferencesDrawer({ open, value, onApply, onClose }) {
  const [draft, setDraft] = useState({ ...EMPTY_DRAFT, ...value });
  const [durationTouched, setDurationTouched] = useState(false);

  // Al abrir, sincroniza el borrador con las preferencias vigentes.
  useEffect(() => {
    if (open) {
      setDraft({ ...EMPTY_DRAFT, ...value });
      setDurationTouched(false);
    }
  }, [open, value]);

  const toggleAge = (age) => {
    setDraft((prev) => {
      const selected = prev.childrenAges.includes(age);
      return {
        ...prev,
        childrenAges: selected
          ? prev.childrenAges.filter((a) => a !== age)
          : [...prev.childrenAges, age],
      };
    });
  };

  const setField = (field, fieldValue) => {
    setDraft((prev) => ({ ...prev, [field]: fieldValue }));
  };

  const handleApply = () => {
    onApply(draft);
  };

  const renderSwitch = (field, label) => (
    <label className="fcp-switch">
      <span className="fcp-switch__label">{label}</span>
      <input
        type="checkbox"
        className="fcp-switch__input"
        checked={draft[field]}
        onChange={(event) => setField(field, event.target.checked)}
      />
      <span className="fcp-switch__track" aria-hidden="true">
        <span className="fcp-switch__thumb" />
      </span>
    </label>
  );

  return (
    <div
      className={`fcp-drawer-root ${open ? "is-open" : ""}`}
      aria-hidden={open ? undefined : true}
    >
      <div
        className="fcp-drawer__backdrop"
        onClick={onClose}
        role="presentation"
      />

      <aside
        className="fcp-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Preferencias familiares"
      >
        <header className="fcp-drawer__head">
          <button
            type="button"
            className="fcp-drawer__close"
            onClick={onClose}
            aria-label="Cerrar preferencias"
          >
            ✕
          </button>
          <h2 className="fcp-drawer__title">Preferencias familiares</h2>
        </header>

        <div className="fcp-drawer__body">
          <fieldset className="fcp-field fcp-field--ages">
            <legend className="fcp-field__legend">Edad de los peques</legend>
            <div className="fcp-chips fcp-chips--wrap">
              {AGE_OPTIONS.map((age) => (
                <button
                  key={age}
                  type="button"
                  className={`fcp-chip ${
                    draft.childrenAges.includes(age) ? "is-active" : ""
                  }`}
                  aria-pressed={draft.childrenAges.includes(age)}
                  onClick={() => toggleAge(age)}
                >
                  {age}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="fcp-field fcp-field--ages">
            <legend className="fcp-field__legend">Duración máxima</legend>
            <div className="fcp-chips fcp-chips--wrap">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`fcp-chip ${
                    durationTouched && draft.maxDuration === opt.value ? "is-active" : ""
                  }`}
                  aria-pressed={durationTouched && draft.maxDuration === opt.value}
                  onClick={() => {
                    setDurationTouched(true);
                    setField("maxDuration", opt.value);
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="fcp-field">
            <label className="fcp-field__legend" htmlFor="fcp-municipality">
              Municipio
            </label>
            <input
              id="fcp-municipality"
              type="text"
              className="fcp-input"
              placeholder="Ej. Bilbao"
              value={draft.municipality}
              onChange={(event) => setField("municipality", event.target.value)}
            />
          </div>

          <div className="fcp-field fcp-field--switches">
            {renderSwitch("strollerFriendly", "Carrito")}
            {renderSwitch("changingTable", "Cambiador")}
            {renderSwitch("rainSuitable", "Cubierto o interior")}
            {renderSwitch("wheelchairAccessible", "Silla de ruedas")}
            {renderSwitch("petsAllowed", "Mascotas")}
          </div>

          <div className="fcp-field fcp-field--switches">
            {renderSwitch("freeOrLowCost", "Gratis o bajo coste")}
          </div>
        </div>

        <footer className="fcp-drawer__foot">
          <button
            type="button"
            className="fcp-btn fcp-btn--primary fcp-btn--block"
            onClick={handleApply}
          >
            Aplicar preferencias
          </button>
        </footer>
      </aside>
    </div>
  );
}

export default FamilyPreferencesDrawer;
