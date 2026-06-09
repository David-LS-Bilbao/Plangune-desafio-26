import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
      setConfirmMessage(t("biz_dashboard.confirm_updated"));
    } else {
      addOffer({ title: activityName, category, age, zone, tags: services, price, location: zone, description, image: coverImage, status: 'pending' });
      setConfirmMessage(t("biz_dashboard.confirm_sent"));
    }
    setShowConfirm(true);
    setTimeout(() => setShowConfirm(false), 3000);
    resetForm();
  };

  return (
    <main className="biz-dashboard-main">

      <div className="biz-dashboard-header">
        <h1 className="biz-dashboard-title">{t("biz_dashboard.title")}</h1>
        <div className="btn-back-wrapper">
          <button type="button" className="btn-text-danger" onClick={() => navigate(-1)}>
            {t("plan_detail.back")}
          </button>
        </div>
      </div>

      <section className="biz-panel biz-panel--resumen">
        <h2 className="biz-panel__title">{t("biz_dashboard.summary")}</h2>

        <div className="biz-stat-btns biz-stat-btns--row">
          <button type="button" className="biz-stat-btn" onClick={() => { const el = document.getElementById("activas"); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 96, behavior: "smooth" }); }}>
            <span className="material-symbols-outlined">event_available</span>
            {t("biz_dashboard.active")}: <strong>{offers.filter(o => o.status === 'active').length}</strong>
          </button>
          <button type="button" className="biz-stat-btn" onClick={() => { const el = document.getElementById("pendientes"); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 96, behavior: "smooth" }); }}>
            <span className="material-symbols-outlined">pending_actions</span>
            {t("biz_dashboard.pending")}: <strong>{offers.filter(o => o.status === 'pending').length}</strong>
          </button>
        </div>

        {message && <p className="status-message">{message}</p>}
      </section>

      <div className="biz-dashboard-grid">

        {/* Columna derecha: nueva actividad */}
        <section className="biz-activity-form biz-activity-form--fixed-width">
          <h2 className="biz-panel__title">{editingId ? t("biz_dashboard.form_title_edit") : t("biz_dashboard.form_title_create")}</h2>

          <form className="create-family-form" onSubmit={handleSubmit}>

            <div
              className="create-offer-media"
              onClick={() => fileInputRef.current.click()}
            >
              {coverImage ? (
                <img src={coverImage} alt={t("biz_dashboard.cover_alt")} className="create-offer-upload__preview" />
              ) : (
                <div className="create-offer-upload">
                  <span className="material-symbols-outlined create-offer-upload__icon">add_photo_alternate</span>
                  <span className="create-offer-upload__primary">{t("biz_dashboard.upload_image")}</span>
                  <span className="create-offer-upload__secondary">{t("biz_dashboard.upload_hint")}</span>
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
              <label className="section-label biz-label" htmlFor="nombre">{t("biz_dashboard.field_name")}</label>
              <input
                type="text"
                id="nombre"
                className={`biz-input${isInvalid("activityName", activityName) ? " biz-input--error" : ""}`}
                placeholder={t("biz_dashboard.field_name_placeholder")}
                value={activityName}
                onChange={(e) => setActivityName(e.target.value)}
                onBlur={() => touch("activityName")}
                required
              />
              {isInvalid("activityName", activityName) && <span className="biz-field-error">{t("biz_dashboard.error_name")}</span>}
            </div>

            <div className="create-family-form__group">
              <label className="section-label biz-label" htmlFor="descripcion">{t("biz_dashboard.field_description")}</label>
              <textarea
                id="descripcion"
                className={`biz-input biz-textarea${isInvalid("description", description) ? " biz-input--error" : ""}`}
                placeholder={t("biz_dashboard.field_description_placeholder")}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => touch("description")}
                required
              />
              {isInvalid("description", description) && <span className="biz-field-error">{t("biz_dashboard.error_description")}</span>}
            </div>

            <div className="create-family-form__group">
              <label className="section-label biz-label" htmlFor="categoria">{t("biz_dashboard.field_category")}</label>
              <select
                id="categoria"
                className={`biz-input${isInvalid("category", category) ? " biz-input--error" : ""}`}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                onBlur={() => touch("category")}
                required
              >
                <option value="" disabled>{t("biz_dashboard.category_placeholder")}</option>
                <option value="Interior">{t("biz_dashboard.cat_indoor")}</option>
                <option value="Exterior">{t("biz_dashboard.cat_outdoor")}</option>
                <option value="Museo">{t("biz_dashboard.cat_museum")}</option>
                <option value="Taller">{t("biz_dashboard.cat_workshop")}</option>
                <option value="Deporte">{t("biz_dashboard.cat_sport")}</option>
              </select>
              {isInvalid("category", category) && <span className="biz-field-error">{t("biz_dashboard.error_category")}</span>}
            </div>

            <div className="create-family-form__group">
              <label className="section-label biz-label" htmlFor="edad">{t("biz_dashboard.field_age")}</label>
              <select
                id="edad"
                className={`biz-input${isInvalid("age", age) ? " biz-input--error" : ""}`}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                onBlur={() => touch("age")}
                required
              >
                <option value="" disabled>{t("biz_dashboard.age_placeholder")}</option>
                <option value="0-3 años">0-3 {t("family_profile.years")}</option>
                <option value="3-6 años">3-6 {t("family_profile.years")}</option>
                <option value="6-12 años">6-12 {t("family_profile.years")}</option>
                <option value="Todas las edades">{t("biz_dashboard.age_all")}</option>
              </select>
              {isInvalid("age", age) && <span className="biz-field-error">{t("biz_dashboard.error_age")}</span>}
            </div>

            <div className="create-family-form__group">
              <label className="section-label biz-label" htmlFor="zona">{t("biz_dashboard.field_zone")}</label>
              <input
                type="text"
                id="zona"
                className={`biz-input${isInvalid("zone", zone) ? " biz-input--error" : ""}`}
                placeholder={t("biz_dashboard.field_zone_placeholder")}
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                onBlur={() => touch("zone")}
                required
              />
              {isInvalid("zone", zone) && <span className="biz-field-error">{t("biz_dashboard.error_zone")}</span>}
            </div>

            <div className="create-family-form__group">
              <label className="section-label biz-label" htmlFor="precio">{t("biz_dashboard.field_price")}</label>
              <input
                type="number"
                id="precio"
                className={`biz-input${isPriceInvalid ? " biz-input--error" : ""}`}
                placeholder={t("biz_dashboard.field_price_placeholder")}
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                onBlur={() => touch("price")}
                required
              />
              {isPriceInvalid && <span className="biz-field-error">{Number(price) < 0 ? t("biz_dashboard.error_price_negative") : t("biz_dashboard.error_price_required")}</span>}
            </div>

            <div className="create-family-form__group">
              <label className="section-label biz-label" htmlFor="servicios">{t("biz_dashboard.field_services")}</label>
              <div className={`biz-tags-field${isServicesInvalid ? " biz-input--error" : ""}`}>
                <div className="biz-tags-row">
                  <input
                    className="biz-tags-input"
                    type="text"
                    id="servicios"
                    placeholder={t("biz_dashboard.field_services_placeholder")}
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
              {isServicesInvalid && <span className="biz-field-error">{t("biz_dashboard.error_services")}</span>}

              {SUGGESTED_SERVICES.some((s) => !services.includes(s)) && (
                <div className="biz-suggestions">
                  <span className="biz-suggestions__label">{t("biz_dashboard.suggestions")}:</span>
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
              <p>{t("biz_dashboard.review_notice")}</p>
            </div>

            <div className="create-family-form__actions">
              <button type="submit" className="btn-primary">
                <span className="material-symbols-outlined">{editingId ? "save" : "send"}</span>
                {editingId ? t("biz_dashboard.save_changes") : t("biz_dashboard.submit")}
              </button>
              <div className="btn-back-wrapper" style={{ width: "fit-content", margin: "0 auto", paddingRight: "0.2rem" }}>
                <button
                  type="button"
                  className="btn-text-danger"
                  onClick={resetForm}
                >
                  {editingId ? t("biz_dashboard.cancel_edit") : t("biz_dashboard.clear_form")}
                </button>
              </div>
            </div>

          </form>
        </section>

        {/* Columna derecha: actividades */}
        <div className="biz-offers-column">
          <section id="activas" className="biz-panel biz-active-list">
            <h2 className="biz-panel__title">{t("biz_dashboard.published_title")}</h2>

            {offers.filter(o => o.status === 'active').length === 0 ? (
              <p className="biz-empty-state">{t("biz_dashboard.published_empty")}</p>
            ) : (
              <div className="biz-active-items">
                {offers.filter(o => o.status === 'active').map((offer) => (
                  <div key={offer.id} className="biz-active-item">
                    <div className="biz-active-item__info">
                      <span className="biz-active-item__title">{offer.title}</span>
                      <div className="biz-active-item__meta">
                        {offer.category && <span>{offer.category}</span>}
                        {offer.zone && <span>{offer.zone}</span>}
                        {offer.price !== undefined && <span>{offer.price === "0" || offer.price === 0 ? t("plan_card.free") : `${offer.price}€`}</span>}
                      </div>
                    </div>
                    <div className="biz-active-item__actions">
                      <button
                        type="button"
                        className="biz-active-item__edit"
                        title={t("biz_dashboard.edit_activity")}
                        onClick={() => handleEdit(offer)}
                      >
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      <button
                        type="button"
                        className="biz-active-item__delete"
                        onClick={() => setConfirmDeleteId(offer.id)}
                        title={t("biz_dashboard.delete_activity")}
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                    {confirmDeleteId === offer.id && (
                      <div className="biz-confirm-delete">
                        <span>{t("biz_dashboard.confirm_delete")}</span>
                        <div className="biz-confirm-delete__actions">
                          <button type="button" className="biz-confirm-delete__yes" onClick={() => { deleteOffer(offer.id); setConfirmDeleteId(null); }}>{t("biz_dashboard.delete_btn")}</button>
                          <button type="button" className="biz-confirm-delete__no" onClick={() => setConfirmDeleteId(null)}>{t("biz_dashboard.cancel_btn")}</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section id="pendientes" className="biz-panel biz-active-list">
            <h2 className="biz-panel__title">{t("biz_dashboard.pending_title")}</h2>

            {offers.filter(o => o.status === 'pending').length === 0 ? (
              <p className="biz-empty-state">{t("biz_dashboard.pending_empty")}</p>
            ) : (
              <div className="biz-active-items">
                {offers.filter(o => o.status === 'pending').map((offer) => (
                  <div key={offer.id} className={`biz-active-item biz-active-item--pending${offer.previousVersion ? " biz-active-item--editing" : ""}`}>
                    <div className="biz-active-item__info">
                      <span className="biz-active-item__title">{offer.title}</span>
                      <div className="biz-active-item__meta">
                        {offer.category && <span>{offer.category}</span>}
                        {offer.zone && <span>{offer.zone}</span>}
                        {offer.price !== undefined && <span>{offer.price === "0" || offer.price === 0 ? t("plan_card.free") : `${offer.price}€`}</span>}
                      </div>
                    </div>
                    <div className="biz-active-item__actions">
                      <button
                        type="button"
                        className="biz-active-item__edit"
                        title={t("biz_dashboard.edit_activity")}
                        onClick={() => handleEdit(offer)}
                      >
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      <button
                        type="button"
                        className="biz-active-item__delete"
                        onClick={() => setConfirmDeleteId(offer.id)}
                        title={t("biz_dashboard.withdraw_activity")}
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                    {confirmDeleteId === offer.id && (
                      <div className={`biz-confirm-delete${offer.previousVersion ? " biz-confirm-delete--stacked" : ""}`}>
                        <span>
                          {offer.previousVersion
                            ? t("biz_dashboard.confirm_undo")
                            : t("biz_dashboard.confirm_withdraw")}
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
                            {offer.previousVersion ? t("biz_dashboard.undo_btn") : t("biz_dashboard.withdraw_btn")}
                          </button>
                          <button type="button" className="biz-confirm-delete__no" onClick={() => setConfirmDeleteId(null)}>{t("biz_dashboard.cancel_btn")}</button>
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
