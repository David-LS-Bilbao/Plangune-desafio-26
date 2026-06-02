import React, { useState } from "react";

function BusinessSubscriptions() {
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handleSelectPlan = (planName) => {
    setSelectedPlan(planName);
  };

  return (
    <main className="business-subscriptions-main">
      <section className="subscriptions-header">
        <p className="page-tag">Suscripciones</p>
        <h1 className="page-title">Planes de pago</h1>
        <p className="page-subtitle">
          Elige el plan que mejor impulse tus promociones y resultados.
        </p>
        {selectedPlan && (
          <p className="section-note">Plan seleccionado: {selectedPlan}</p>
        )}
      </section>

      <section className="subscriptions-grid">
        <article className="subscription-card">
          <div className="subscription-top">
            <span className="subscription-name">Base</span>
            <span className="subscription-price">€29/mes</span>
          </div>
          <ul className="subscription-list">
            <li>Visibilidad básica en el buscador</li>
            <li>2 ofertas patrocinadas</li>
            <li>Acceso a estadísticas simples</li>
          </ul>
          <button
            className="btn-primary-full"
            type="button"
            onClick={() => handleSelectPlan("Base")}
          >
            Seleccionar plan
          </button>
        </article>

        <article className="subscription-card featured">
          <div className="subscription-top">
            <span className="subscription-name">Pro</span>
            <span className="subscription-price">€59/mes</span>
          </div>
          <ul className="subscription-list">
            <li>Prioridad en resultados</li>
            <li>Destacados en el mapa</li>
            <li>Filtro patrocinado activado</li>
            <li>Mailing mensual a familias</li>
          </ul>
          <button
            className="btn-primary-full"
            type="button"
            onClick={() => handleSelectPlan("Pro")}
          >
            Seleccionar plan
          </button>
        </article>

        <article className="subscription-card">
          <div className="subscription-top">
            <span className="subscription-name">Premium</span>
            <span className="subscription-price">€99/mes</span>
          </div>
          <ul className="subscription-list">
            <li>Todo Pro + destacado extra</li>
            <li>Campañas de mailing personalizadas</li>
            <li>Soporte prioritario</li>
          </ul>
          <button
            className="btn-primary-full"
            type="button"
            onClick={() => handleSelectPlan("Premium")}
          >
            Seleccionar plan
          </button>
        </article>
      </section>
    </main>
  );
}

export default BusinessSubscriptions;
