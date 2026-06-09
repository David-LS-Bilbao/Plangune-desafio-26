import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useBusinessStore } from "../store";

const EMPTY_OFFER = {
  title: "",
  description: "",
  conditions: "",
  associatedActivity: "",
  originalPrice: "",
  offerType: "",
  discountValue: "",
  usageLimit: "",
  promoCode: "",
  startDate: "",
  endDate: "",
};

function ManageOffers() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const addOffer = useBusinessStore((state) => state.addOffer);
  const updateOffer = useBusinessStore((state) => state.updateOffer);
  const deleteOffer = useBusinessStore((state) => state.deleteOffer);
  const offers = useBusinessStore((state) => state.offers);

  const [offerData, setOfferData] = useState(EMPTY_OFFER);
  const [editingId, setEditingId] = useState(null);
  const [touched, setTouched] = useState({});
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const fileInputRef = useRef(null);

  const touch = (field) => setTouched((prev) => ({ ...prev, [field]: true }));
  const isInvalid = (field, value) => touched[field] && !value;
  const isFreeActivity = Number(offerData.originalPrice) === 0 && offerData.originalPrice !== "";
  const requiresDiscountValue =
    !isFreeActivity && (offerData.offerType === "discount" || offerData.offerType === "fixed_amount");
  const isDiscountValueInvalid = requiresDiscountValue && touched.discountValue && offerData.discountValue === "";
  const isDateRangeInvalid =
    offerData.startDate && offerData.endDate && offerData.startDate > offerData.endDate;

  const handleChange = (e) => {
    const { id, value } = e.target;
    setOfferData((prev) => {
      const next = { ...prev, [id]: value };
      if (id === "originalPrice" && Number(value) === 0 && value !== "") {
        next.discountValue = "";
      }
      return next;
    });
  };

  const handleEdit = (offer) => {
    setEditingId(offer.id);
    setOfferData({
      title: offer.title || "",
      description: offer.description || "",
      conditions: offer.conditions || "",
      associatedActivity: offer.activity || "",
      originalPrice: offer.originalPrice !== undefined ? String(offer.originalPrice) : "",
      offerType: offer.offerType || "",
      discountValue: offer.discountValue !== undefined ? String(offer.discountValue) : "",
      usageLimit: offer.usageLimit !== undefined ? String(offer.usageLimit) : "",
      promoCode: offer.promoCode || "",
      startDate: offer.startDate || "",
      endDate: offer.endDate || "",
    });
    setCoverImage(offer.image || null);
    setTouched({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setOfferData(EMPTY_OFFER);
    setEditingId(null);
    setCoverImage(null);
    setTouched({});
  };

  const offerTypeUnit = { discount: "%", fixed_amount: "€", bogo: "", gift: "" };

  const formatDiscountValue = () => {
    const unit = offerTypeUnit[offerData.offerType];
    if (!unit || offerData.discountValue === "") return "";
    return `${offerData.discountValue}${unit}`;
  };

  const getFinalPrice = () => {
    const price = Number(offerData.originalPrice);
    const value = Number(offerData.discountValue);
    if (offerData.originalPrice === "" || Number.isNaN(price)) return null;
    if (price === 0) return 0;
    if (offerData.offerType === "discount" && offerData.discountValue !== "") {
      return Math.max(price - (price * value) / 100, 0);
    }
    if (offerData.offerType === "fixed_amount" && offerData.discountValue !== "") {
      return Math.max(price - value, 0);
    }
    return price;
  };

  const formatPriceSummary = () => {
    if (offerData.originalPrice === "") return "";
    const original = Number(offerData.originalPrice);
    if (original === 0) return t("plan_card.free");
    const final = getFinalPrice();
    if (final === null || final === original) return `${original}€`;
    return `${original}€ → ${final.toFixed(2).replace(/\.00$/, "")}€`;
  };

  const formatMeta = () => {
    const parts = [formatPriceSummary(), formatDiscountValue()].filter(Boolean);
    if (parts.length > 0) return parts.join(" · ");
    return offerData.promoCode ? `${t("manage_offers.code_label")}: ${offerData.promoCode}` : t("manage_offers.no_code");
  };

  const handleSendReview = () => {
    if (!offerData.title || !offerData.description || !offerData.associatedActivity || offerData.originalPrice === "" || !offerData.offerType || !offerData.startDate || !offerData.endDate) {
      setTouched((prev) => ({
        ...prev,
        title: true,
        description: true,
        associatedActivity: true,
        originalPrice: true,
        offerType: true,
        startDate: true,
        endDate: true,
      }));
      return;
    }
    if (requiresDiscountValue && offerData.discountValue === "") {
      touch("discountValue");
      return;
    }
    if (isDateRangeInvalid) {
      touch("startDate");
      touch("endDate");
      return;
    }
    if (editingId) {
      const editedOffer = offers.find((o) => o.id === editingId);
      const previousVersion =
        editedOffer?.status === "active"
          ? { ...editedOffer, previousVersion: undefined }
          : editedOffer?.previousVersion;
      updateOffer(editingId, {
        title: offerData.title,
        description: offerData.description,
        conditions: offerData.conditions,
        activity: offerData.associatedActivity || "Actividad General",
        originalPrice: offerData.originalPrice,
        offerType: offerData.offerType,
        discountValue: offerData.discountValue,
        usageLimit: offerData.usageLimit,
        promoCode: offerData.promoCode,
        startDate: offerData.startDate,
        endDate: offerData.endDate,
        image: coverImage,
        meta: formatMeta(),
        status: "pending",
        previousVersion,
      });
      setConfirmMessage(t("manage_offers.confirm_updated"));
    } else {
      addOffer({
        title: offerData.title,
        description: offerData.description,
        conditions: offerData.conditions,
        activity: offerData.associatedActivity || "Actividad General",
        originalPrice: offerData.originalPrice,
        offerType: offerData.offerType,
        discountValue: offerData.discountValue,
        usageLimit: offerData.usageLimit,
        promoCode: offerData.promoCode,
        startDate: offerData.startDate,
        endDate: offerData.endDate,
        image: coverImage,
        icon: "local_offer",
        meta: formatMeta(),
        status: "pending",
      });
      setConfirmMessage(t("manage_offers.confirm_sent"));
    }
    setShowConfirm(true);
    setTimeout(() => setShowConfirm(false), 3000);
    resetForm();
  };

  return (
    <main className="biz-dashboard-main">

      <div className="biz-dashboard-header">
        <h1 className="biz-dashboard-title">{t("manage_offers.title")}</h1>
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
      </section>

      <div className="biz-dashboard-grid">

        {/* Columna izquierda: formulario */}
        <section className="biz-activity-form">
          <h2 className="biz-panel__title">{editingId ? t("manage_offers.form_title_edit") : t("manage_offers.form_title_create")}</h2>

          <form className="create-family-form" onSubmit={(e) => e.preventDefault()}>

            <div className="create-offer-media" onClick={() => fileInputRef.current.click()}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) setCoverImage(URL.createObjectURL(file));
                }}
              />
              {coverImage ? (
                <img src={coverImage} alt={t("biz_dashboard.cover_alt")} className="create-offer-upload__preview" />
              ) : (
                <div className="create-offer-upload">
                  <span className="material-symbols-outlined create-offer-upload__icon">add_photo_alternate</span>
                  <span className="create-offer-upload__primary">{t("biz_dashboard.upload_image")}</span>
                  <span className="create-offer-upload__secondary">{t("biz_dashboard.upload_hint")}</span>
                </div>
              )}
            </div>

            <div className="create-family-form__group">
              <label className="section-label biz-label" htmlFor="title">{t("manage_offers.field_title")}</label>
              <input
                type="text" id="title" className={`biz-input${isInvalid("title", offerData.title) ? " biz-input--error" : ""}`}
                placeholder={t("manage_offers.field_title_placeholder")}
                value={offerData.title} onChange={handleChange} onBlur={() => touch("title")}
              />
              {isInvalid("title", offerData.title) && <span className="biz-field-error">{t("manage_offers.error_title")}</span>}
            </div>

            <div className="create-family-form__group">
              <label className="section-label biz-label" htmlFor="description">{t("biz_dashboard.field_description")}</label>
              <textarea
                id="description" className={`biz-input biz-textarea${isInvalid("description", offerData.description) ? " biz-input--error" : ""}`}
                placeholder={t("manage_offers.field_description_placeholder")}
                value={offerData.description} onChange={handleChange} onBlur={() => touch("description")}
              />
              {isInvalid("description", offerData.description) && <span className="biz-field-error">{t("biz_dashboard.error_description")}</span>}
            </div>

            <div className="create-family-form__group">
              <label className="section-label biz-label" htmlFor="conditions">
                {t("manage_offers.field_conditions")}
                <span className="create-offer-optional">{t("manage_offers.optional")}</span>
              </label>
              <textarea
                id="conditions" className="biz-input biz-textarea"
                placeholder={t("manage_offers.field_conditions_placeholder")}
                value={offerData.conditions} onChange={handleChange}
              />
            </div>

            <div className="create-family-form__group">
              <label className="section-label biz-label" htmlFor="associatedActivity">{t("manage_offers.field_activity")}</label>
              <select
                id="associatedActivity"
                className={`biz-input${isInvalid("associatedActivity", offerData.associatedActivity) ? " biz-input--error" : ""}`}
                value={offerData.associatedActivity}
                onChange={handleChange}
                onBlur={() => touch("associatedActivity")}
              >
                <option value="" disabled>{t("manage_offers.field_activity_placeholder")}</option>
                {offers.filter((o) => o.status === "active" && !o.offerType).map((activity) => (
                  <option key={activity.id} value={activity.title}>{activity.title}</option>
                ))}
              </select>
              {isInvalid("associatedActivity", offerData.associatedActivity) && <span className="biz-field-error">{t("manage_offers.error_activity")}</span>}
            </div>

            <div className="create-offer-group">
              <div className="create-family-form__group">
                <label className="section-label biz-label" htmlFor="originalPrice">{t("manage_offers.field_price")}</label>
                <input
                  type="number" id="originalPrice"
                  className={`biz-input${isInvalid("originalPrice", offerData.originalPrice) ? " biz-input--error" : ""}`}
                  placeholder={t("manage_offers.field_price_placeholder")}
                  min="0"
                  step="0.01"
                  value={offerData.originalPrice} onChange={handleChange}
                  onBlur={() => touch("originalPrice")}
                />
                {isInvalid("originalPrice", offerData.originalPrice) && <span className="biz-field-error">{t("manage_offers.error_price")}</span>}
                {formatPriceSummary() && offerData.offerType !== "bogo" && offerData.offerType !== "gift" && (
                  <span className="create-offer-price-preview">{t("manage_offers.price_preview")}: <strong>{formatPriceSummary()}</strong></span>
                )}
              </div>

              <div className="create-family-form__group">
                <label className="section-label biz-label" htmlFor="offerType">{t("manage_offers.field_offer_type")}</label>
                <select
                  id="offerType"
                  className={`biz-input${isInvalid("offerType", offerData.offerType) ? " biz-input--error" : ""}`}
                  value={offerData.offerType}
                  onChange={handleChange}
                  onBlur={() => touch("offerType")}
                >
                  <option value="" disabled>{t("manage_offers.offer_type_placeholder")}</option>
                  <option value="discount">{t("manage_offers.type_discount")}</option>
                  <option value="fixed_amount">{t("manage_offers.type_fixed")}</option>
                  <option value="bogo">{t("manage_offers.type_bogo")}</option>
                  <option value="gift">{t("manage_offers.type_gift")}</option>
                </select>
                {isInvalid("offerType", offerData.offerType) && <span className="biz-field-error">{t("manage_offers.error_offer_type")}</span>}
              </div>

              {requiresDiscountValue && (
                <div className="create-family-form__group">
                  <label className="section-label biz-label" htmlFor="discountValue">
                    {t("manage_offers.field_discount_value", { unit: offerData.offerType === "discount" ? "%" : "€" })}
                  </label>
                  <input
                    type="number" id="discountValue"
                    className={`biz-input${isDiscountValueInvalid ? " biz-input--error" : ""}`}
                    placeholder={offerData.offerType === "discount" ? t("manage_offers.discount_placeholder_percent") : t("manage_offers.discount_placeholder_fixed")}
                    min="0"
                    step={offerData.offerType === "discount" ? "1" : "0.01"}
                    value={offerData.discountValue} onChange={handleChange}
                    onBlur={() => touch("discountValue")}
                  />
                  {isDiscountValueInvalid && <span className="biz-field-error">{t("manage_offers.error_discount_value")}</span>}
                </div>
              )}

              <div className="create-family-form__group">
                <label className="section-label biz-label" htmlFor="usageLimit">
                  {t("manage_offers.field_usage_limit")}
                  <span className="create-offer-optional">{t("manage_offers.optional")}</span>
                </label>
                <input
                  type="number" id="usageLimit" className="biz-input"
                  placeholder={t("manage_offers.usage_limit_placeholder")}
                  min="0"
                  step="1"
                  value={offerData.usageLimit} onChange={handleChange}
                />
                <span className="create-offer-help">{t("manage_offers.usage_limit_help")}</span>
              </div>

              <div className="create-family-form__group">
                <label className="section-label biz-label" htmlFor="promoCode">
                  {t("manage_offers.field_promo_code")}
                  <span className="create-offer-optional">{t("manage_offers.optional")}</span>
                </label>
                <input type="text" id="promoCode" className="biz-input" placeholder="TXIKI20" value={offerData.promoCode} onChange={handleChange} />
              </div>

              <div className="create-offer-dates">
                <div className="create-family-form__group">
                  <label className="section-label biz-label" htmlFor="startDate">{t("manage_offers.field_start_date")}</label>
                  <input
                    type="date"
                    id="startDate"
                    className={`biz-input${(isInvalid("startDate", offerData.startDate) || (touched.startDate && isDateRangeInvalid)) ? " biz-input--error" : ""}`}
                    value={offerData.startDate}
                    onChange={handleChange}
                    onBlur={() => touch("startDate")}
                  />
                  {isInvalid("startDate", offerData.startDate) && <span className="biz-field-error">{t("manage_offers.error_start_date")}</span>}
                </div>
                <div className="create-family-form__group">
                  <label className="section-label biz-label" htmlFor="endDate">{t("manage_offers.field_end_date")}</label>
                  <input
                    type="date"
                    id="endDate"
                    className={`biz-input${(isInvalid("endDate", offerData.endDate) || (touched.endDate && isDateRangeInvalid)) ? " biz-input--error" : ""}`}
                    value={offerData.endDate}
                    onChange={handleChange}
                    onBlur={() => touch("endDate")}
                  />
                  {isInvalid("endDate", offerData.endDate) && <span className="biz-field-error">{t("manage_offers.error_end_date")}</span>}
                </div>
              </div>
              {(touched.startDate || touched.endDate) && isDateRangeInvalid && (
                <span className="biz-field-error">{t("manage_offers.error_date_range")}</span>
              )}
            </div>

            <div className="biz-activity-form create-offer-notice">
              <span className="material-symbols-outlined fill" style={{ color: 'var(--accent-color)', fontSize: '1.5rem' }}>info</span>
              <p>{t("manage_offers.review_notice")}</p>
            </div>

            <div className="create-family-form__actions">
              <button type="button" className="btn-primary" onClick={handleSendReview}>
                <span className="material-symbols-outlined">{editingId ? "save" : "send"}</span>
                {editingId ? t("manage_offers.save_changes") : t("manage_offers.submit")}
              </button>
              <div className="btn-back-wrapper" style={{ width: "fit-content", margin: "0 auto", paddingRight: "0.2rem" }}>
                <button type="button" className="btn-text-danger" onClick={resetForm}>
                  {editingId ? t("manage_offers.cancel_edit") : t("manage_offers.clear_form")}
                </button>
              </div>
            </div>

          </form>
        </section>

        {/* Columna derecha: lista de ofertas */}
        <div className="biz-offers-column">
          <section id="activas" className="biz-panel biz-active-list">
            <h2 className="biz-panel__title">{t("manage_offers.active_title")}</h2>
            {offers.filter(o => o.status === 'active').length === 0 ? (
              <p className="biz-empty-state">{t("manage_offers.active_empty")}</p>
            ) : (
              <div className="biz-active-items">
                {offers.filter(o => o.status === 'active').map((offer) => (
                  <div key={offer.id} className="biz-active-item">
                    <div className="biz-active-item__info">
                      <span className="biz-active-item__title">{offer.title}</span>
                      <div className="biz-active-item__meta">
                        {offer.activity && <span>{offer.activity}</span>}
                        {offer.meta && <span>{offer.meta}</span>}
                        {offer.usageLimit && <span>{t("manage_offers.usage_limit_label", { count: offer.usageLimit })}</span>}
                      </div>
                    </div>
                    <div className="biz-active-item__actions">
                      <button type="button" className="biz-active-item__edit" title={t("manage_offers.edit_offer")} onClick={() => handleEdit(offer)}>
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      <button type="button" className="biz-active-item__delete" title={t("manage_offers.delete_offer")} onClick={() => setConfirmDeleteId(offer.id)}>
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                    {confirmDeleteId === offer.id && (
                      <div className="biz-confirm-delete biz-confirm-delete--neutral">
                        <span>{t("manage_offers.confirm_delete")}</span>
                        <div className="biz-confirm-delete__actions">
                          <button type="button" className="biz-confirm-delete__yes" onClick={() => { deleteOffer(offer.id); setConfirmDeleteId(null); }}>{t("manage_offers.delete_btn")}</button>
                          <button type="button" className="biz-confirm-delete__no" onClick={() => setConfirmDeleteId(null)}>{t("manage_offers.cancel_btn")}</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section id="pendientes" className="biz-panel biz-active-list">
            <h2 className="biz-panel__title">{t("manage_offers.pending_title")}</h2>
            {offers.filter(o => o.status === 'pending').length === 0 ? (
              <p className="biz-empty-state">{t("manage_offers.pending_empty")}</p>
            ) : (
              <div className="biz-active-items">
                {offers.filter(o => o.status === 'pending').map((offer) => (
                  <div key={offer.id} className={`biz-active-item biz-active-item--pending${offer.previousVersion ? " biz-active-item--editing" : ""}`}>
                    <div className="biz-active-item__info">
                      <span className="biz-active-item__title">{offer.title}</span>
                      <div className="biz-active-item__meta">
                        {offer.activity && <span>{offer.activity}</span>}
                        {offer.meta && <span>{offer.meta}</span>}
                        {offer.usageLimit && <span>{t("manage_offers.usage_limit_label", { count: offer.usageLimit })}</span>}
                      </div>
                    </div>
                    <div className="biz-active-item__actions">
                      <button type="button" className="biz-active-item__edit" title={t("manage_offers.edit_offer")} onClick={() => handleEdit(offer)}>
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      <button type="button" className="biz-active-item__delete" title={t("manage_offers.withdraw_offer")} onClick={() => setConfirmDeleteId(offer.id)}>
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                    {confirmDeleteId === offer.id && (
                      <div className={`biz-confirm-delete${offer.previousVersion ? " biz-confirm-delete--stacked" : ""}`}>
                        <span>
                          {offer.previousVersion
                            ? t("manage_offers.confirm_undo")
                            : t("manage_offers.confirm_withdraw")}
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
                            {offer.previousVersion ? t("manage_offers.undo_btn") : t("manage_offers.withdraw_btn")}
                          </button>
                          <button type="button" className="biz-confirm-delete__no" onClick={() => setConfirmDeleteId(null)}>{t("manage_offers.cancel_btn")}</button>
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

export default ManageOffers;
