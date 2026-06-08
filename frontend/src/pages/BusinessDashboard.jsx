import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useBusinessStore } from "../store";

const SUGGESTED_SERVICES = [
  "Apto Carrito",
  "Cambiador",
  "Trona",
  "Interior",
  "Aire Libre",
  "Menú infantil",
];

function BusinessDashboard() {
  const navigate = useNavigate();
  const [activityName, setActivityName] = useState("");
  const [category, setCategory] = useState("");
  const [age, setAge] = useState("");
  const [zone, setZone] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState("");
  const [message, setMessage] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [touched, setTouched] = useState({});
  const [coverImage, setCoverImage] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const fileInputRef = useRef(null);

  const touch = (field) => setTouched((prev) => ({ ...prev, [field]: true }));
  const isInvalid = (field, value) => touched[field] && !value;
  const isPriceInvalid = touched["price"] && (price === "" || Number(price) < 0);
  const isServicesInvalid = touched["services"] && services.length === 0;

  const addOffer = useBusinessStore((state) => state.addOffer);
  const updateOffer = useBusinessStore((state) => state.updateOffer);
  const deleteOffer = useBusinessStore((state) => state.deleteOffer);
  const offers = useBusinessStore((state) => state.offers);

  const handleEdit = (offer) => {
    setEditingId(offer.id);
    setActivityName(offer.title || "");
    setCategory(offer.category || "");
    setAge(offer.age || "");
    setZone(offer.zone || "");
    setPrice(offer.price !== undefined ? String(offer.price) : "");
    setDescription(offer.description || "");
    setServices(offer.tags || []);
    setCoverImage(offer.image || null);
    setMessage("");
    setTouched({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleServiceAdd = () => {
    const trimmed = newService.trim();
    if (trimmed && !services.includes(trimmed)) {
      setServices((prev) => [...prev, trimmed]);
      setNewService("");
    }
  };

  const handleServiceKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleServiceAdd();
    }
  };

  const handleServiceRemove = (serviceToRemove) => {
    setServices((prev) => prev.filter((s) => s !== serviceToRemove));
  };

  const handleSuggestionClick = (suggestion) => {
    touch("services");
    if (!services.includes(suggestion)) {
      setServices((prev) => [...prev, suggestion]);
    }
  };

  const resetForm = () => {
    setActivityName("");
    setCategory("");
    setAge("");
    setZone("");
    setPrice("");
    setDescription("");
    setServices([]);
    setCoverImage(null);
    setMessage("");
    setTouched({});
    setEditingId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      const editedOffer = offers.find((o) => o.id === editingId);
      const previousVersion =
        editedOffer?.status === "active"
          ? { ...editedOffer, previousVersion: undefined }
          : editedOffer?.previousVersion;
      updateOffer(editingId, { title: activityName, category, age, zone, tags: services, price, location: zone, description, image: coverImage, status: 'pending', previousVersion });
      setConfirmMessage("Actividad actualizada y enviada a revisión.");
    } else {
      addOffer({ title: activityName, category, age, zone, tags: services, price, location: zone, description, image: coverImage, status: 'pending' });
      setConfirmMessage("Tu actividad se ha enviado a revisión.");
    }
    setShowConfirm(true);
    setTimeout(() => setShowConfirm(false), 3000);
    resetForm();
  };

  return (
    <main className="biz-dashboard-main">

      <div className="biz-dashboard-header">
        <h1 className="biz-dashboard-title">Gestionar actividad</h1>
        <div className="btn-back-wrapper">
          <button type="button" className="btn-text-danger" onClick={() => navigate(-1)}>
            Volver atrás
          </button>
        </div>
      </div>

      <section className="biz-panel biz-panel--resumen">
        <h2 className="biz-panel__title">Resumen</h2>

        <div className="biz-stat-btns biz-stat-btns--row">
          <button type="button" className="biz-stat-btn" onClick={() => { const el = document.getElementById("activas"); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 96, behavior: "smooth" }); }}>
            <span className="material-symbols-outlined">event_available</span>
            Activas: <strong>{offers.filter(o => o.status === 'active').length}</strong>
          </button>
          <button type="button" className="biz-stat-btn" onClick={() => { const el = document.getElementById("pendientes"); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 96, behavior: "smooth" }); }}>
            <span className="material-symbols-outlined">pending_actions</span>
            Pendientes: <strong>{offers.filter(o => o.status === 'pending').length}</strong>
          </button>
        </div>

        {message && <p className="status-message">{message}</p>}
      </section>

      <div className="biz-dashboard-grid">

        {/* Columna derecha: nueva actividad */}
        <section className="biz-activity-form biz-activity-form--fixed-width">
          <h2 className="biz-panel__title">{editingId ? "Modificar actividad" : "Crear / editar actividad"}</h2>

          <form className="create-family-form" onSubmit={handleSubmit}>

            <div
              className="create-offer-media"
              onClick={() => fileInputRef.current.click()}
            >
              {coverImage ? (
                <img src={coverImage} alt="Portada de la actividad" className="create-offer-upload__preview" />
              ) : (
                <div className="create-offer-upload">
                  <span className="material-symbols-outlined create-offer-upload__icon">add_photo_alternate</span>
                  <span className="create-offer-upload__primary">Subir imagen de portada</span>
                  <span className="create-offer-upload__secondary">PNG, JPG o WEBP · Recomendado 16:9 · Máx. 5MB</span>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) setCoverImage(URL.createObjectURL(file));
                }}
              />
            </div>

            <div className="create-family-form__group">
              <label className="section-label biz-label" htmlFor="nombre">Nombre actividad</label>
              <input
                type="text"
                id="nombre"
                className={`biz-input${isInvalid("activityName", activityName) ? " biz-input--error" : ""}`}
                placeholder="Ej: Taller de cuentos"
                value={activityName}
                onChange={(e) => setActivityName(e.target.value)}
                onBlur={() => touch("activityName")}
                required
              />
              {isInvalid("activityName", activityName) && <span className="biz-field-error">Ponle un nombre a tu actividad</span>}
            </div>

            <div className="create-family-form__group">
              <label className="section-label biz-label" htmlFor="descripcion">Descripción</label>
              <textarea
                id="descripcion"
                className={`biz-input biz-textarea${isInvalid("description", description) ? " biz-input--error" : ""}`}
                placeholder="Describe tu actividad: qué se hace, qué incluye, qué necesitan traer..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => touch("description")}
                required
              />
              {isInvalid("description", description) && <span className="biz-field-error">Añade una descripción de la actividad</span>}
            </div>

            <div className="create-family-form__group">
              <label className="section-label biz-label" htmlFor="categoria">Categoría</label>
              <select
                id="categoria"
                className={`biz-input${isInvalid("category", category) ? " biz-input--error" : ""}`}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                onBlur={() => touch("category")}
                required
              >
                <option value="" disabled>Selecciona una categoría...</option>
                <option value="Interior">Interior</option>
                <option value="Exterior">Exterior</option>
                <option value="Museo">Museo</option>
                <option value="Taller">Taller</option>
                <option value="Deporte">Deporte</option>
              </select>
              {isInvalid("category", category) && <span className="biz-field-error">Selecciona una categoría</span>}
            </div>

            <div className="create-family-form__group">
              <label className="section-label biz-label" htmlFor="edad">Edad</label>
              <select
                id="edad"
                className={`biz-input${isInvalid("age", age) ? " biz-input--error" : ""}`}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                onBlur={() => touch("age")}
                required
              >
                <option value="" disabled>Selecciona una edad...</option>
                <option value="0-3 años">0-3 años</option>
                <option value="3-6 años">3-6 años</option>
                <option value="6-12 años">6-12 años</option>
                <option value="Todas las edades">Todas las edades</option>
              </select>
              {isInvalid("age", age) && <span className="biz-field-error">Indica el rango de edad</span>}
            </div>

            <div className="create-family-form__group">
              <label className="section-label biz-label" htmlFor="zona">Zona</label>
              <input
                type="text"
                id="zona"
                className={`biz-input${isInvalid("zone", zone) ? " biz-input--error" : ""}`}
                placeholder="Ej: Bilbao, Getxo, Barakaldo..."
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                onBlur={() => touch("zone")}
                required
              />
              {isInvalid("zone", zone) && <span className="biz-field-error">¿Dónde se realiza la actividad?</span>}
            </div>

            <div className="create-family-form__group">
              <label className="section-label biz-label" htmlFor="precio">Precio (€)</label>
              <input
                type="number"
                id="precio"
                className={`biz-input${isPriceInvalid ? " biz-input--error" : ""}`}
                placeholder="Ej: 0, 5.50, 12..."
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                onBlur={() => touch("price")}
                required
              />
              {isPriceInvalid && <span className="biz-field-error">{Number(price) < 0 ? "El precio no puede ser negativo" : "Indica el precio (0 si es gratis)"}</span>}
            </div>

            <div className="create-family-form__group">
              <label className="section-label biz-label" htmlFor="servicios">Servicios</label>
              <div className={`biz-tags-field${isServicesInvalid ? " biz-input--error" : ""}`}>
                <div className="biz-tags-row">
                  <input
                    className="biz-tags-input"
                    type="text"
                    id="servicios"
                    placeholder="Ej: menú infantil, carrito..."
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    onKeyDown={handleServiceKeyDown}
                    onBlur={() => touch("services")}
                  />
                  <button type="button" className="biz-service-add" onClick={() => { touch("services"); handleServiceAdd(); }}>
                    <span className="material-symbols-outlined">add</span>
                  </button>
                </div>
                {services.length > 0 && (
                  <div className="biz-tags-list">
                    {services.map((service) => (
                      <span key={service} className="biz-service-tag">
                        {service}
                        <span
                          className="material-symbols-outlined"
                          onClick={() => handleServiceRemove(service)}
                        >close</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {isServicesInvalid && <span className="biz-field-error">Añade al menos un servicio</span>}

              {SUGGESTED_SERVICES.some((s) => !services.includes(s)) && (
                <div className="biz-suggestions">
                  <span className="biz-suggestions__label">Sugerencias:</span>
                  <div className="biz-tags-list">
                    {SUGGESTED_SERVICES.filter((s) => !services.includes(s)).map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        className="biz-service-suggestion"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <span className="material-symbols-outlined">add</span>
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="biz-activity-form create-offer-notice">
              <span className="material-symbols-outlined fill" style={{ color: 'var(--accent-color)', fontSize: '1.5rem' }}>info</span>
              <p>Las actividades deben ser revisadas por el equipo de Plangune antes de publicarse.</p>
            </div>

            <div className="create-family-form__actions">
              <button type="submit" className="btn-primary">
                <span className="material-symbols-outlined">{editingId ? "save" : "send"}</span>
                {editingId ? "Guardar cambios" : "Enviar a revisión"}
              </button>
              <div className="btn-back-wrapper" style={{ width: "fit-content", margin: "0 auto", paddingRight: "0.2rem" }}>
                <button
                  type="button"
                  className="btn-text-danger"
                  onClick={resetForm}
                >
                  {editingId ? "Cancelar edición" : "Limpiar formulario"}
                </button>
              </div>
            </div>

          </form>
        </section>

        {/* Columna derecha: actividades */}
        <div className="biz-offers-column">
          <section id="activas" className="biz-panel biz-active-list">
            <h2 className="biz-panel__title">Actividades publicadas</h2>

            {offers.filter(o => o.status === 'active').length === 0 ? (
              <p className="biz-empty-state">Aún no tienes actividades activas.</p>
            ) : (
              <div className="biz-active-items">
                {offers.filter(o => o.status === 'active').map((offer) => (
                  <div key={offer.id} className="biz-active-item">
                    <div className="biz-active-item__info">
                      <span className="biz-active-item__title">{offer.title}</span>
                      <div className="biz-active-item__meta">
                        {offer.category && <span>{offer.category}</span>}
                        {offer.zone && <span>{offer.zone}</span>}
                        {offer.price !== undefined && <span>{offer.price === "0" || offer.price === 0 ? "Gratis" : `${offer.price}€`}</span>}
                      </div>
                    </div>
                    <div className="biz-active-item__actions">
                      <button
                        type="button"
                        className="biz-active-item__edit"
                        title="Editar actividad"
                        onClick={() => handleEdit(offer)}
                      >
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      <button
                        type="button"
                        className="biz-active-item__delete"
                        onClick={() => setConfirmDeleteId(offer.id)}
                        title="Eliminar actividad"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                    {confirmDeleteId === offer.id && (
                      <div className="biz-confirm-delete">
                        <span>¿Seguro que quieres eliminar esta actividad?</span>
                        <div className="biz-confirm-delete__actions">
                          <button type="button" className="biz-confirm-delete__yes" onClick={() => { deleteOffer(offer.id); setConfirmDeleteId(null); }}>Eliminar</button>
                          <button type="button" className="biz-confirm-delete__no" onClick={() => setConfirmDeleteId(null)}>Cancelar</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section id="pendientes" className="biz-panel biz-active-list">
            <h2 className="biz-panel__title">Pendientes de revisión</h2>

            {offers.filter(o => o.status === 'pending').length === 0 ? (
              <p className="biz-empty-state">No tienes actividades pendientes.</p>
            ) : (
              <div className="biz-active-items">
                {offers.filter(o => o.status === 'pending').map((offer) => (
                  <div key={offer.id} className={`biz-active-item biz-active-item--pending${offer.previousVersion ? " biz-active-item--editing" : ""}`}>
                    <div className="biz-active-item__info">
                      <span className="biz-active-item__title">{offer.title}</span>
                      <div className="biz-active-item__meta">
                        {offer.category && <span>{offer.category}</span>}
                        {offer.zone && <span>{offer.zone}</span>}
                        {offer.price !== undefined && <span>{offer.price === "0" || offer.price === 0 ? "Gratis" : `${offer.price}€`}</span>}
                      </div>
                    </div>
                    <div className="biz-active-item__actions">
                      <button
                        type="button"
                        className="biz-active-item__edit"
                        title="Editar actividad"
                        onClick={() => handleEdit(offer)}
                      >
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      <button
                        type="button"
                        className="biz-active-item__delete"
                        onClick={() => setConfirmDeleteId(offer.id)}
                        title="Retirar actividad"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                    {confirmDeleteId === offer.id && (
                      <div className={`biz-confirm-delete${offer.previousVersion ? " biz-confirm-delete--stacked" : ""}`}>
                        <span>
                          {offer.previousVersion
                            ? "¿Seguro que quieres deshacer estos cambios? La actividad volverá a estar activa con su versión anterior."
                            : "¿Seguro que quieres retirar esta actividad?"}
                        </span>
                        <div className="biz-confirm-delete__actions">
                          <button
                            type="button"
                            className="biz-confirm-delete__yes"
                            onClick={() => {
                              if (offer.previousVersion) {
                                updateOffer(offer.id, { ...offer.previousVersion, id: offer.id, previousVersion: undefined });
                              } else {
                                deleteOffer(offer.id);
                              }
                              setConfirmDeleteId(null);
                            }}
                          >
                            {offer.previousVersion ? "Deshacer cambios" : "Retirar"}
                          </button>
                          <button type="button" className="biz-confirm-delete__no" onClick={() => setConfirmDeleteId(null)}>Cancelar</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

      </div>
      {showConfirm && (
        <div className="save-confirm-overlay" onClick={() => setShowConfirm(false)}>
          <div className="save-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <span className="material-symbols-outlined save-confirm-icon">check_circle</span>
            <p className="save-confirm-text">{confirmMessage}</p>
          </div>
        </div>
      )}
    </main>
  );
}

export default BusinessDashboard;
