import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBusinessStore } from "../store";

function BusinessStrategy() {
  const navigate = useNavigate();
  const [strategyOptimized, setStrategyOptimized] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [upgradeMessage, setUpgradeMessage] = useState("");
  const { subscription } = useBusinessStore();

  const handleFeatureClick = (featureId) => {
    if (subscription === "Free") {
      setUpgradeMessage("Mejora tu plan para activar estas funcionalidades. Haz click aquí.");
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
      <div className="biz-dashboard-header">
        <h1 className="page-title">Plan de visibilidad</h1>
        <div className="btn-back-wrapper">
          <button type="button" className="btn-text-danger" onClick={() => navigate(-1)}>
            Volver atrás
          </button>
        </div>
      </div>

      

      {upgradeMessage && (
        <button
          type="button"
          onClick={() => navigate("/negocio/suscripciones")}
          style={{ marginBottom: "1rem", padding: "1rem", borderRadius: "0.75rem", border: "0.2rem solid var(--accent-color)", color: "var(--accent-color)", background: "none", cursor: "pointer", textAlign: "left", width: "100%", fontSize: "1.1rem", fontFamily: "var(--font-poppins)", transition: "color 0.2s, border-color 0.2s, background-color 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.color = "var(--white-pure)"; e.currentTarget.style.borderColor = "var(--accent-color)"; e.currentTarget.style.backgroundColor = "var(--accent-color)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "var(--accent-color)"; e.currentTarget.style.borderColor = "var(--accent-color)"; e.currentTarget.style.backgroundColor = "transparent"; }}
        >
          <span className="material-symbols-outlined" style={{ verticalAlign: "middle", marginRight: "8px", fontSize: "1.5rem" }}>error</span>
          Mejora tu plan para activar estas funcionalidades. <span style={{ textDecoration: "underline" }}>Haz click aquí.</span>
        </button>
      )}

      <section className="strategy-features-grid">
        <button
          className={`feature-card ${selectedFeatures.includes("destacados") ? "selected" : ""}`}
          onClick={() => handleFeatureClick("destacados")}
          style={{ textAlign: "left", width: "100%" }}
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
          style={{ textAlign: "left", width: "100%" }}
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
          style={{ textAlign: "left", width: "100%" }}
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
          style={{ textAlign: "left", width: "100%" }}
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
