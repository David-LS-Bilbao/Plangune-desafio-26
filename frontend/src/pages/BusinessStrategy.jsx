import React, { useState } from "react";

function BusinessStrategy() {
  const [strategyOptimized, setStrategyOptimized] = useState(false);

  const handleOptimize = () => {
    setStrategyOptimized(true);
  };

  return (
    <main className="business-strategy-main">
      <section className="strategy-header">
        <p className="page-tag">Mi estrategia</p>
        <h1 className="page-title">Tu plan de visibilidad</h1>
        <p className="page-subtitle">
          Activa las funciones clave que amplían el alcance de tu negocio y
          mejoran tu captación.
        </p>
      </section>

      <section className="strategy-intro">
        <p>
          Estas son las herramientas que puedes usar para destacar tu negocio
          dentro de TxikiPlan:
        </p>
      </section>

      <section className="strategy-features-grid">
        <article className="feature-card">
          <span className="material-symbols-outlined feature-icon">star</span>
          <h2 className="feature-title">Destacados</h2>
          <p className="feature-text">
            Aparece en secciones premium del buscador y recibe más impresiones.
          </p>
        </article>

        <article className="feature-card">
          <span className="material-symbols-outlined feature-icon">mail</span>
          <h2 className="feature-title">Mailing</h2>
          <p className="feature-text">
            Envía mensajes directos a familias interesadas con tus promociones
            más relevantes.
          </p>
        </article>

        <article className="feature-card">
          <span className="material-symbols-outlined feature-icon">map</span>
          <h2 className="feature-title">Destacados en el mapa</h2>
          <p className="feature-text">
            Tu ubicación se resaltará para que las familias te encuentren
            rápidamente.
          </p>
        </article>

        <article className="feature-card">
          <span className="material-symbols-outlined feature-icon">
            filter_alt
          </span>
          <h2 className="feature-title">Filtro patrocinado</h2>
          <p className="feature-text">
            Aparece primero cuando las familias usan filtros avanzados en su
            búsqueda.
          </p>
        </article>
      </section>

      <section className="strategy-summary-card">
        <div>
          <h2 className="section-title">Tu estrategia ahora</h2>
          <p>
            Aumenta tu visibilidad con las funciones seleccionadas y maximiza la
            conversión de tus actividades.
          </p>
          {strategyOptimized && (
            <p className="section-note">Estrategia optimizada correctamente.</p>
          )}
        </div>
        <button
          className="btn-primary-full"
          type="button"
          onClick={handleOptimize}
        >
          Optimizar estrategia
        </button>
      </section>
    </main>
  );
}

export default BusinessStrategy;
