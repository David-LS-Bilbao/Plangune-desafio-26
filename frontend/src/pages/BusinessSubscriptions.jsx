import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useBusinessStore } from "../store";

/**
 * Pantalla demostrativa de planes de pago del área negocio (NO procesa pagos reales).
 * Copy de Marketing: planes Landa (gratis) / Mendi (destacado) / Gailur.
 *
 * El plan gratuito se muestra como "Landa", pero internamente el store usa "Free" para el
 * tier gratuito (BusinessStrategy.jsx depende de `subscription === "Free"` para su gate de
 * upgrade). Por eso se mapea Free↔Landa solo en esta pantalla.
 */
const FREE_PLAN = "Landa";
const storeToDisplay = (sub) => (!sub || sub === "Free" ? FREE_PLAN : sub);
const displayToStore = (name) => (name === FREE_PLAN ? "Free" : name);

function BusinessSubscriptions() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { subscription, setSubscription } = useBusinessStore();
  const [selectedPlan, setSelectedPlan] = useState(storeToDisplay(subscription));
  const [toastMsg, setToastMsg] = useState("");

  const PLANS = [
    {
      name: "Landa",
      price: "0€",
      cta: t("biz_subscriptions.plan_landa_cta"),
      free: true,
      features: [
        t("biz_subscriptions.plan_landa_f1"),
        t("biz_subscriptions.plan_landa_f2"),
        t("biz_subscriptions.plan_landa_f3"),
        t("biz_subscriptions.plan_landa_f4"),
        t("biz_subscriptions.plan_landa_f5"),
        t("biz_subscriptions.plan_landa_f6"),
      ],
    },
    {
      name: "Mendi",
      price: "39€",
      annual: t("biz_subscriptions.plan_mendi_annual"),
      cta: t("biz_subscriptions.plan_mendi_cta"),
      featured: true,
      features: [
        t("biz_subscriptions.plan_mendi_f1"),
        t("biz_subscriptions.plan_mendi_f2"),
        t("biz_subscriptions.plan_mendi_f3"),
        t("biz_subscriptions.plan_mendi_f4"),
        {
          text: t("biz_subscriptions.plan_mendi_f5"),
          sub: [
            t("biz_subscriptions.plan_mendi_f5_s1"),
            t("biz_subscriptions.plan_mendi_f5_s2"),
            t("biz_subscriptions.plan_mendi_f5_s3"),
          ],
        },
        t("biz_subscriptions.plan_mendi_f6"),
        t("biz_subscriptions.plan_mendi_f7"),
        t("biz_subscriptions.plan_mendi_f8"),
      ],
    },
    {
      name: "Gailur",
      price: "119€",
      annual: t("biz_subscriptions.plan_gailur_annual"),
      cta: t("biz_subscriptions.plan_gailur_cta"),
      top: true,
      features: [
        t("biz_subscriptions.plan_gailur_f1"),
        t("biz_subscriptions.plan_gailur_f2"),
        t("biz_subscriptions.plan_gailur_f3"),
        t("biz_subscriptions.plan_gailur_f4"),
        t("biz_subscriptions.plan_gailur_f5"),
        t("biz_subscriptions.plan_gailur_f6"),
        t("biz_subscriptions.plan_gailur_f7"),
        t("biz_subscriptions.plan_gailur_f8"),
        t("biz_subscriptions.plan_gailur_f9"),
        t("biz_subscriptions.plan_gailur_f10"),
        t("biz_subscriptions.plan_gailur_f11"),
      ],
    },
  ];

  const handleSelectPlan = (planName) => {
    if (planName === selectedPlan) return;
    setSelectedPlan(planName);
    setSubscription(displayToStore(planName));
    setToastMsg(
      planName === FREE_PLAN
        ? t("biz_subscriptions.toast_free")
        : t("biz_subscriptions.toast_paid", { plan: planName }),
    );
    setTimeout(() => setToastMsg(""), 3500);
  };

  const handleCancelPlan = () => {
    setSelectedPlan(FREE_PLAN);
    setSubscription("Free");
    setToastMsg(t("biz_subscriptions.toast_cancelled"));
    setTimeout(() => setToastMsg(""), 3500);
  };

  return (
    <main className="business-subscriptions-main">
      {toastMsg && (
        <div className="subscription-toast">
          <span className="material-symbols-outlined">check_circle</span>
          {toastMsg}
        </div>
      )}

      <div className="biz-dashboard-header">
        <h1 className="page-title">{t("biz_subscriptions.title")}</h1>
        <div className="btn-back-wrapper">
          <button type="button" className="btn-text-danger" onClick={() => navigate(-1)}>
            {t("plan_detail.back")}
          </button>
        </div>
      </div>

      <div className="subscription-active-banner">
        <span className="material-symbols-outlined fill">workspace_premium</span>
        <span>{t("biz_subscriptions.current_plan")}: <strong>{selectedPlan}</strong></span>
        {selectedPlan !== FREE_PLAN && (
          <button type="button" className="subscription-cancel-btn" onClick={handleCancelPlan}>
            {t("biz_subscriptions.cancel_plan")}
          </button>
        )}
      </div>

      <p className="subscriptions-note">{t("biz_subscriptions.demo_note")}</p>

      <section className="subscriptions-grid">
        {PLANS.map((plan) => {
          const isActive = selectedPlan === plan.name;
          return (
            <article
              key={plan.name}
              className={`subscription-card${plan.featured ? " featured" : ""}${plan.top ? " top" : ""}${isActive ? " active" : ""}`}
            >
              {isActive ? (
                <div className="subscription-active-badge">
                  <span className="material-symbols-outlined fill" style={{ fontSize: "1rem" }}>check_circle</span>
                  {t("biz_subscriptions.active_badge")}
                </div>
              ) : plan.featured ? (
                <div className="subscription-recommended-badge">
                  <span className="material-symbols-outlined fill" style={{ fontSize: "1rem" }}>star</span>
                  {t("biz_subscriptions.recommended_badge")}
                </div>
              ) : plan.top ? (
                <div className="subscription-top-badge">
                  <span className="material-symbols-outlined fill" style={{ fontSize: "1rem" }}>military_tech</span>
                  {t("biz_subscriptions.top_badge")}
                </div>
              ) : plan.free ? (
                <div className="subscription-free-badge">
                  <span className="material-symbols-outlined fill" style={{ fontSize: "1rem" }}>sell</span>
                  {t("biz_subscriptions.free_badge")}
                </div>
              ) : null}

              <div className="subscription-top">
                <span className="subscription-name">{plan.name}</span>
                <span className="subscription-price">
                  {plan.price}
                  <span className="subscription-period">{t("biz_subscriptions.period")}</span>
                </span>
              </div>

              <button
                className="btn-primary-full"
                type="button"
                disabled={isActive}
                onClick={() => handleSelectPlan(plan.name)}
              >
                {isActive ? t("biz_subscriptions.active_badge") : plan.cta}
              </button>

              {plan.annual && (
                <div className="subscription-annual">
                  <span className="subscription-annual__label">{t("biz_subscriptions.annual_label")}</span>
                  <span className="subscription-annual__value">{plan.annual}</span>
                </div>
              )}

              <ul className="subscription-list">
                {plan.features.map((feature) => {
                  const item = typeof feature === "string" ? { text: feature } : feature;
                  return (
                    <li key={item.text}>
                      {item.text}
                      {item.sub && (
                        <ul className="subscription-sublist">
                          {item.sub.map((s) => (
                            <li key={s}>{s}</li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </article>
          );
        })}
      </section>

      <section className="subscriptions-pitch">
        <h2 className="subscriptions-pitch__title">{t("biz_subscriptions.pitch_title")}</h2>
        <p className="subscriptions-pitch__lead">{t("biz_subscriptions.pitch_lead")}</p>
        <p>{t("biz_subscriptions.pitch_p1")}</p>
        <p>{t("biz_subscriptions.pitch_p2")}</p>
      </section>
    </main>
  );
}

export default BusinessSubscriptions;
