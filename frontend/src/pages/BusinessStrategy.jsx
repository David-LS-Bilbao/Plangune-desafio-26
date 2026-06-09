import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useBusinessStore } from "../store";

function BusinessStrategy() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [strategyOptimized, setStrategyOptimized] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [upgradeMessage, setUpgradeMessage] = useState("");
  const { subscription } = useBusinessStore();

  const handleFeatureClick = (featureId) => {
    if (subscription === "Free") {
      setUpgradeMessage(true);
      return;
    }
    setUpgradeMessage(false);
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
        <h1 className="page-title">{t("biz_strategy.title")}</h1>
        <div className="btn-back-wrapper">
          <button type="button" className="btn-text-danger" onClick={() => navigate(-1)}>
            {t("plan_detail.back")}
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
          {t("biz_strategy.upgrade_message")} <span style={{ textDecoration: "underline" }}>{t("biz_strategy.upgrade_link")}</span>
        </button>
      )}

      <section className="strategy-features-grid">
        <button
          className={`feature-card ${selectedFeatures.includes("destacados") ? "selected" : ""}`}
          onClick={() => handleFeatureClick("destacados")}
          style={{ textAlign: "left", width: "100%" }}
        >
          <span className="material-symbols-outlined feature-icon">star</span>
          <h2 className="feature-title">{t("biz_strategy.feature_highlighted_title")}</h2>
          <p className="feature-text">{t("biz_strategy.feature_highlighted_desc")}</p>
        </button>

        <button
          className={`feature-card ${selectedFeatures.includes("mailing") ? "selected" : ""}`}
          onClick={() => handleFeatureClick("mailing")}
          style={{ textAlign: "left", width: "100%" }}
        >
          <span className="material-symbols-outlined feature-icon">mail</span>
          <h2 className="feature-title">{t("biz_strategy.feature_mailing_title")}</h2>
          <p className="feature-text">{t("biz_strategy.feature_mailing_desc")}</p>
        </button>

        <button
          className={`feature-card ${selectedFeatures.includes("mapa") ? "selected" : ""}`}
          onClick={() => handleFeatureClick("mapa")}
          style={{ textAlign: "left", width: "100%" }}
        >
          <span className="material-symbols-outlined feature-icon">map</span>
          <h2 className="feature-title">{t("biz_strategy.feature_map_title")}</h2>
          <p className="feature-text">{t("biz_strategy.feature_map_desc")}</p>
        </button>

        <button
          className={`feature-card ${selectedFeatures.includes("filtro") ? "selected" : ""}`}
          onClick={() => handleFeatureClick("filtro")}
          style={{ textAlign: "left", width: "100%" }}
        >
          <span className="material-symbols-outlined feature-icon">filter_alt</span>
          <h2 className="feature-title">{t("biz_strategy.feature_filter_title")}</h2>
          <p className="feature-text">{t("biz_strategy.feature_filter_desc")}</p>
        </button>
      </section>

      <section className="strategy-summary-card">
        <div>
          <h2 className="section-title">{t("biz_strategy.summary_title")}</h2>
          <p>{t("biz_strategy.summary_desc")}</p>
          {strategyOptimized && (
            <p className="section-note">{t("biz_strategy.strategy_optimized")}</p>
          )}
        </div>
        <button
          className="btn-primary-full"
          type="button"
          onClick={handleOptimize}
        >
          {t("biz_strategy.optimize_btn")}
        </button>
      </section>
    </main>
  );
}

export default BusinessStrategy;
