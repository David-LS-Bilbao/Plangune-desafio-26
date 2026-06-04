import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useBusinessStore } from "../store";

function BusinessSubscriptions() {
  const { t } = useTranslation();
  const { subscription, setSubscription } = useBusinessStore();
  const [selectedPlan, setSelectedPlan] = useState(subscription);
  const [toastMsg, setToastMsg] = useState("");

  const handleSelectPlan = (planName) => {
    if (planName === selectedPlan) return;
    setSelectedPlan(planName);
    setSubscription(planName);
    setToastMsg(t('subscriptions.successToast', { plan: planName }));
    setTimeout(() => setToastMsg(""), 3500);
  };

  const plans = [
    { name: "Base", price: "€29/mes", features: ["Visibilidad básica en el buscador", "2 ofertas patrocinadas", "Acceso a estadísticas simples"] },
    { name: "Pro", price: "€59/mes", features: ["Prioridad en resultados", "Destacados en el mapa", "Filtro patrocinado activado", "Mailing mensual a familias"], featured: true },
    { name: "Premium", price: "€99/mes", features: ["Todo Pro + destacado extra", "Campañas de mailing personalizadas", "Soporte prioritario"] },
  ];

  return (
    <main className="business-subscriptions-main">
      {/* Toast */}
      {toastMsg && (
        <div className="subscription-toast">
          <span className="material-symbols-outlined">check_circle</span>
          {toastMsg}
        </div>
      )}

      <section className="subscriptions-header">
        <p className="page-tag">{t('subscriptions.tag', 'Suscripciones')}</p>
        <h1 className="page-title">{t('subscriptions.title', 'Planes de pago')}</h1>
        <p className="page-subtitle">
          {t('subscriptions.subtitle', 'Elige el plan que mejor impulse tus promociones y resultados.')}
        </p>
        {selectedPlan && (
          <p className="section-note">
            <span className="material-symbols-outlined" style={{ fontSize: '1rem', verticalAlign: 'middle' }}>stars</span>
            {' '}{t('subscriptions.activePlan', 'Plan activo:')} <strong>{selectedPlan}</strong>
          </p>
        )}
      </section>

      <section className="subscriptions-grid">
        {plans.map((plan) => {
          const isActive = selectedPlan === plan.name;
          return (
            <article
              key={plan.name}
              className={`subscription-card${plan.featured ? ' featured' : ''}${isActive ? ' active' : ''}`}
            >
              {isActive && (
                <div className="subscription-active-badge">
                  <span className="material-symbols-outlined fill" style={{ fontSize: '1rem' }}>check_circle</span>
                  {t('subscriptions.currentPlanBadge', 'Plan actual')}
                </div>
              )}
              <div className="subscription-top">
                <span className="subscription-name">{plan.name}</span>
                <span className="subscription-price">{plan.price}</span>
              </div>
              <ul className="subscription-list">
                {plan.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <button
                className="btn-primary-full"
                type="button"
                disabled={isActive}
                onClick={() => handleSelectPlan(plan.name)}
              >
                {isActive ? t('subscriptions.planActiveBtn', 'Plan activo') : t('subscriptions.selectPlan', 'Seleccionar plan')}
              </button>
            </article>
          );
        })}
      </section>
    </main>
  );
}

export default BusinessSubscriptions;
