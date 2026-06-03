import React, { useState } from "react";
import { useBusinessStore } from "../store";

function BusinessStrategy() {
  const [strategyOptimized, setStrategyOptimized] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [upgradeMessage, setUpgradeMessage] = useState("");
  const { subscription } = useBusinessStore();

  const handleFeatureClick = (featureId) => {
    if (subscription === "Free") {
      setUpgradeMessage("Mejora tu plan para activar estas funcionalidades.");
      return;
    }
    setUpgradeMessage("");
    if (selectedFeatures.includes(featureId)) {
      setSelectedFeatures(selectedFeatures.filter(id => id !== featureId));
    } else {
      setSelectedFeatures([...selectedFeatures, featureId]);
    }
  };

  const handleOptimize = () => {
    if (subscription === "Free" && selectedFeatures.length > 0) {
       return;
    }
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

      {upgradeMessage && (
        <div className="alert-error" style={{ marginBottom: "1rem", color: "var(--md-sys-color-error)", backgroundColor: "var(--md-sys-color-error-container)", padding: "1rem", borderRadius: "8px" }}>
          <span className="material-symbols-outlined" style={{ verticalAlign: "middle", marginRight: "8px" }}>error</span>
          {upgradeMessage}
        </div>
      )}

      <section className="strategy-features-grid">
        <button 
          className={`feature-card ${selectedFeatures.includes("destacados") ? "selected" : ""}`}
          onClick={() => handleFeatureClick("destacados")}
          style={{ textAlign: "left", width: "100%", border: selectedFeatures.includes("destacados") ? "2px solid var(--md-sys-color-primary)" : undefined }}
        >
          <span className="material-symbols-outlined feature-icon">star</span>
          <h2 className="feature-title">Destacados</h2>
          <p className="feature-text">
            Aparece en secciones premium del buscador y recibe más impresiones.
          </p>
        </button>

        <button 
          className={`feature-card ${selectedFeatures.includes("mailing") ? "selected" : ""}`}
          onClick={() => handleFeatureClick("mailing")}
          style={{ textAlign: "left", width: "100%", border: selectedFeatures.includes("mailing") ? "2px solid var(--md-sys-color-primary)" : undefined }}
        >
          <span className="material-symbols-outlined feature-icon">mail</span>
          <h2 className="feature-title">Mailing</h2>
          <p className="feature-text">
            Envía mensajes directos a familias interesadas con tus promociones
            más relevantes.
          </p>
        </button>

        <button 
          className={`feature-card ${selectedFeatures.includes("mapa") ? "selected" : ""}`}
          onClick={() => handleFeatureClick("mapa")}
          style={{ textAlign: "left", width: "100%", border: selectedFeatures.includes("mapa") ? "2px solid var(--md-sys-color-primary)" : undefined }}
        >
          <span className="material-symbols-outlined feature-icon">map</span>
          <h2 className="feature-title">Destacados en el mapa</h2>
          <p className="feature-text">
            Tu ubicación se resaltará para que las familias te encuentren
            rápidamente.
          </p>
        </button>

        <button 
          className={`feature-card ${selectedFeatures.includes("filtro") ? "selected" : ""}`}
          onClick={() => handleFeatureClick("filtro")}
          style={{ textAlign: "left", width: "100%", border: selectedFeatures.includes("filtro") ? "2px solid var(--md-sys-color-primary)" : undefined }}
        >
          <span className="material-symbols-outlined feature-icon">
            filter_alt
          </span>
          <h2 className="feature-title">Filtro patrocinado</h2>
          <p className="feature-text">
            Aparece primero cuando las familias usan filtros avanzados en su
            búsqueda.
          </p>
        </button>
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
