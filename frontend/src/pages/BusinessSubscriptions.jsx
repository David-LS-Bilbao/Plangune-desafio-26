import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBusinessStore } from "../store";

function BusinessSubscriptions() {
  const navigate = useNavigate();
  const { subscription, setSubscription } = useBusinessStore();
  const [selectedPlan, setSelectedPlan] = useState(subscription);
  const [toastMsg, setToastMsg] = useState("");

  const handleSelectPlan = (planName) => {
    if (planName === selectedPlan) return;
    setSelectedPlan(planName);
    setSubscription(planName);
    setToastMsg(`✓ Plan ${planName} activado correctamente`);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const handleCancelPlan = () => {
    setSelectedPlan("Free");
    setSubscription("Free");
    setToastMsg("✓ Plan cancelado. Ahora estás en el plan Free");
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

      <div className="biz-dashboard-header">
        <h1 className="page-title">Planes de pago</h1>
        <div className="btn-back-wrapper">
          <button type="button" className="btn-text-danger" onClick={() => navigate(-1)}>
            Volver atrás
          </button>
        </div>
      </div>

      {selectedPlan && (
        <div className="subscription-active-banner">
          <span className="material-symbols-outlined fill">workspace_premium</span>
          <span>Plan activo: <strong>{selectedPlan}</strong></span>
          {selectedPlan !== "Free" && (
            <button
              type="button"
              className="subscription-cancel-btn"
              onClick={handleCancelPlan}
            >
              Cancelar plan
            </button>
          )}
        </div>
      )}

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
                  Plan actual
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
                {isActive ? 'Plan activo' : 'Seleccionar plan'}
              </button>
            </article>
          );
        })}
      </section>
    </main>
  );
}

export default BusinessSubscriptions;
