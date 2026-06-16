import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../store";

const DAY_KEYS = ["lun", "mar", "mie", "jue", "vie", "sab", "dom"];
const DAY_ORDER = Object.fromEntries(DAY_KEYS.map((key, i) => [key, i]));

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const h = String(i).padStart(2, "0");
  return `${h}:00`;
});

const EMPTY_SLOT = { day: "", m_from: "", m_to: "", a_from: "", a_to: "", continuous: false };

function BusinessProfile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  const DAYS = DAY_KEYS.map((key) => ({ key, label: t(`biz_profile.day_${key}`) }));

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
    if (name === "name" && !value.trim()) return t("biz_profile.error_name");
    if (name === "nif" && !value.trim()) return t("biz_profile.error_nif");
    if (name === "address" && !value.trim()) return t("biz_profile.error_address");
    if (name === "phone" && !value.trim()) return t("biz_profile.error_phone");
    if (name === "email") {
      if (!value.trim()) return t("biz_profile.error_email_required");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return t("biz_profile.error_email_invalid");
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
    if (!profile.name.trim()) newErrors.name = t("biz_profile.error_name");
    if (!profile.nif.trim()) newErrors.nif = t("biz_profile.error_nif");
    if (!profile.address.trim()) newErrors.address = t("biz_profile.error_address");
    if (!profile.phone.trim()) newErrors.phone = t("biz_profile.error_phone");
    if (!profile.email.trim()) newErrors.email = t("biz_profile.error_email_required");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) newErrors.email = t("biz_profile.error_email_invalid");
    return newErrors;
  };

  const handleSlotChange = (field, value) => {
    setSlot((prev) => ({ ...prev, [field]: value }));
  };

  const [scheduleError, setScheduleError] = useState("");

  const handleAddSlot = () => {
    if (!slot.day || !slot.m_from || !slot.m_to) return;

    if (slot.m_to <= slot.m_from) {
      setScheduleError(t("biz_profile.schedule_error_morning"));
      return;
    }
    if (slot.a_from && slot.a_from < slot.m_to) {
      setScheduleError(t("biz_profile.schedule_error_afternoon_start"));
      return;
    }
    if (slot.a_from && slot.a_to && slot.a_to <= slot.a_from) {
      setScheduleError(t("biz_profile.schedule_error_afternoon_end"));
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
    if (s.continuous) return t("biz_profile.schedule_continuous_format", { from: s.m_from, to: s.a_to });
    const morning = `${s.m_from} – ${s.m_to}`;
    const afternoon = s.a_from && s.a_to ? ` / ${s.a_from} – ${s.a_to}` : "";
    return morning + afternoon;
  };

  const usedDays = new Set(scheduleList.map((s) => s.day));

  return (
    <main className="biz-dashboard-main">
      <div className="biz-dashboard-header">
        <h1 className="page-title">{t("biz_profile.title")}</h1>
        <div className="btn-back-wrapper">
          <button type="button" className="btn-text-danger" onClick={() => navigate(-1)}>
            {t("plan_detail.back")}
          </button>
        </div>
      </div>

      <section className="biz-activity-form">
        <form className="create-family-form" onSubmit={handleSave}>

          <div className="create-family-form__group">
            <label className="section-label biz-label" htmlFor="name">{t("biz_profile.field_name")}</label>
            <input
              id="name" name="name" type="text"
              className={`biz-input${errors.name ? ' biz-input--error' : ''}`}
              placeholder={t("biz_profile.field_name_placeholder")}
              value={profile.name} onChange={handleChange} onBlur={handleBlur}
            />
            {errors.name && <span className="biz-field-error">{errors.name}</span>}
          </div>

          <div className="create-family-form__group">
            <label className="section-label biz-label" htmlFor="nif">{t("biz_profile.field_nif")}</label>
            <input
              id="nif" name="nif" type="text"
              className={`biz-input${errors.nif ? ' biz-input--error' : ''}`}
              placeholder={t("biz_profile.field_nif_placeholder")}
              value={profile.nif} onChange={handleChange} onBlur={handleBlur}
            />
            {errors.nif && <span className="biz-field-error">{errors.nif}</span>}
          </div>

          <div className="create-family-form__group">
            <label className="section-label biz-label" htmlFor="description">{t("biz_dashboard.field_description")}</label>
            <textarea
              id="description" name="description" className="biz-input"
              placeholder={t("biz_profile.field_description_placeholder")}
              value={profile.description} onChange={handleChange}
              style={{ height: '9rem', padding: '0.75rem 1rem', resize: 'vertical' }}
            />
          </div>

          <div className="create-family-form__group">
            <label className="section-label biz-label" htmlFor="address">{t("biz_profile.field_address")}</label>
            <input
              id="address" name="address" type="text"
              className={`biz-input${errors.address ? ' biz-input--error' : ''}`}
              placeholder={t("biz_profile.field_address_placeholder")}
              value={profile.address} onChange={handleChange} onBlur={handleBlur}
            />
            {errors.address && <span className="biz-field-error">{errors.address}</span>}
          </div>

          <div className="create-family-form__group">
            <label className="section-label biz-label" htmlFor="phone">{t("biz_profile.field_phone")}</label>
            <input
              id="phone" name="phone" type="tel"
              className={`biz-input${errors.phone ? ' biz-input--error' : ''}`}
              placeholder={t("biz_profile.field_phone_placeholder")}
              value={profile.phone} onChange={handleChange} onBlur={handleBlur}
            />
            {errors.phone && <span className="biz-field-error">{errors.phone}</span>}
          </div>

          <div className="create-family-form__group">
            <label className="section-label biz-label" htmlFor="email">{t("biz_profile.field_email")}</label>
            <input
              id="email" name="email" type="email"
              className={`biz-input${errors.email ? ' biz-input--error' : ''}`}
              placeholder={t("biz_profile.field_email_placeholder")}
              value={profile.email} onChange={handleChange} onBlur={handleBlur}
            />
            {errors.email && <span className="biz-field-error">{errors.email}</span>}
          </div>

          {/* ── Horario ── */}
          <div className="create-family-form__group">
            <label className="section-label biz-label">{t("biz_profile.field_schedule")}</label>

            <div className="schedule-builder">
              <select
                className="biz-input schedule-select"
                value={slot.day}
                onChange={(e) => handleSlotChange("day", e.target.value)}
              >
                <option value="">{t("biz_profile.schedule_day_placeholder")}</option>
                {DAYS.filter(({ key }) => !usedDays.has(key)).map(({ key, label }) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>

              <div className="schedule-shift">
                <span className="schedule-shift-label">{t("biz_profile.schedule_from_to")}</span>
                <div className="schedule-shift-times">
                  <select
                    className="biz-input schedule-time-select"
                    value={slot.m_from}
                    onChange={(e) => handleSlotChange("m_from", e.target.value)}
                  >
                    <option value="">{t("biz_profile.schedule_start")}</option>
                    {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                  <span className="schedule-separator">—</span>
                  <select
                    className="biz-input schedule-time-select"
                    value={slot.m_to}
                    onChange={(e) => handleSlotChange("m_to", e.target.value)}
                  >
                    <option value="">{t("biz_profile.schedule_end")}</option>
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
                <span>{t("biz_profile.schedule_continuous")}</span>
              </label>

              {!slot.continuous && (
                <hr className="schedule-divider" />
              )}

              {!slot.continuous && (
                <div className="schedule-shift">
                  <span className="schedule-shift-label">
                    {t("biz_profile.schedule_from_to_optional")} <span className="schedule-optional">{t("biz_profile.schedule_optional")}</span>
                  </span>
                  <div className="schedule-shift-times">
                    <select
                      className="biz-input schedule-time-select"
                      value={slot.a_from}
                      onChange={(e) => handleSlotChange("a_from", e.target.value)}
                    >
                      <option value="">{t("biz_profile.schedule_start")}</option>
                      {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <span className="schedule-separator">—</span>
                    <select
                      className="biz-input schedule-time-select"
                      value={slot.a_to}
                      onChange={(e) => handleSlotChange("a_to", e.target.value)}
                    >
                      <option value="">{t("biz_profile.schedule_end")}</option>
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
                {t("biz_profile.schedule_add")}
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
                          aria-label={t("biz_profile.schedule_remove")}
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
              {t("biz_profile.save")}
            </button>
            <span className="btn-reset-wrapper">
              <button type="button" className="btn-reset" onClick={handleReset}>
                {t("biz_profile.reset")}
              </button>
            </span>
          </div>

        </form>
      </section>
      {showConfirm && (
        <div className="save-confirm-overlay" onClick={() => setShowConfirm(false)}>
          <div className="save-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <span className="material-symbols-outlined save-confirm-icon">check_circle</span>
            <p className="save-confirm-text">{t("biz_profile.saved_ok")}</p>
          </div>
        </div>
      )}
    </main>
  );
}

export default BusinessProfile;
