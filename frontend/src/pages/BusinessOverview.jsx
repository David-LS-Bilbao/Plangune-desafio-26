import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useBusinessStore } from "../store";

function BusinessOverview() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { offers, stats, fetchOffers } = useBusinessStore();

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  return (
    <main className="business-overview-main">
      {/* Welcome Section */}
      <section className="overview-header">
        <h2 className="overview-title">{t("biz_overview.greeting")}</h2>
        <p className="overview-subtitle">{t("biz_overview.subtitle")}</p>
      </section>

      {/* Quick Actions (Bento Box style) */}
      <section className="quick-actions-grid">
        {/* Action 1: Primary Prominent */}
        <button
          className="action-card primary"
          type="button"
          onClick={() => navigate("/negocio")}
        >
          <div className="action-icon">
            <span className="material-symbols-outlined fill">add_circle</span>
          </div>
          <h3 className="action-title">{t("biz_overview.action_manage_activity")}</h3>
        </button>

        <button
          className="action-card secondary"
          type="button"
          onClick={() => navigate("/negocio/ofertas")}
        >
          <div className="action-icon">
            <span className="material-symbols-outlined">sell</span>
          </div>
          <h3 className="action-title">{t("biz_overview.action_manage_offer")}</h3>
        </button>

        <button
          className="action-card utility"
          type="button"
          onClick={() => navigate("/negocio/estrategia")}
        >
          <div className="action-icon-utility text-primary">
            <span className="material-symbols-outlined">insights</span>
          </div>
          <h3 className="action-title-utility">{t("biz_overview.action_visibility")}</h3>
        </button>

        <button
          className="action-card utility"
          type="button"
          onClick={() => navigate("/negocio/suscripciones")}
        >
          <div className="action-icon-utility text-primary">
            <span className="material-symbols-outlined">payments</span>
          </div>
          <h3 className="action-title-utility">{t("biz_overview.action_plans")}</h3>
        </button>

        <button
          className="action-card utility"
          type="button"
          onClick={() => navigate("/negocio/resenas")}
        >
          <div className="action-icon-utility text-primary">
            <span className="material-symbols-outlined">reviews</span>
          </div>
          <h3 className="action-title-utility">{t("biz_overview.action_reviews")}</h3>
        </button>

        <button
          className="action-card utility"
          type="button"
          onClick={() => navigate("/negocio/perfil")}
        >
          <div className="action-icon-utility text-primary">
            <span className="material-symbols-outlined">edit</span>
          </div>
          <h3 className="action-title-utility">{t("biz_overview.action_edit_profile")}</h3>
        </button>
      </section>

      {/* KPIs Section */}
      <section className="kpis-section">
        <div className="kpis-header">
          <h3 className="kpis-title">{t("biz_overview.kpi_title")}</h3>
          <div className="btn-link-wrapper">
            <button
              className="btn-link"
              type="button"
              onClick={() => navigate("/negocio/rendimiento")}
            >
              {t("biz_overview.kpi_report")}
            </button>
          </div>
        </div>

        <div className="kpis-grid">
          <div className="kpi-card">
            <span className="kpi-value">{offers.length}</span>
            <div className="kpi-top">
              <span className="kpi-label">{t("biz_overview.kpi_activities")}</span>
              <span className="material-symbols-outlined kpi-icon fill">event_available</span>
            </div>
          </div>

          <div className="kpi-card">
            <span className="kpi-value">1</span>
            <div className="kpi-top">
              <span className="kpi-label">{t("biz_overview.kpi_offers")}</span>
              <span className="material-symbols-outlined kpi-icon fill">local_offer</span>
            </div>
          </div>

          <div className="kpi-card">
            <span className="kpi-value">1</span>
            <div className="kpi-top">
              <span className="kpi-label">{t("biz_overview.kpi_pending")}</span>
              <span className="material-symbols-outlined kpi-icon">pending_actions</span>
            </div>
          </div>

          <div className="kpi-card kpi-card--accent">
            <span className="kpi-value">12</span>
            <div className="kpi-top">
              <span className="kpi-label">{t("biz_overview.kpi_reviews")}</span>
              <span className="material-symbols-outlined kpi-icon fill">star_rate</span>
              <span className="kpi-trend">{t("biz_overview.kpi_reviews_trend")}</span>
            </div>
          </div>

          <div className="kpi-card kpi-card--accent">
            <span className="kpi-value">1.2k</span>
            <div className="kpi-top">
              <span className="kpi-label">{t("biz_overview.kpi_views")}</span>
              <span className="material-symbols-outlined kpi-icon">visibility</span>
              <span className="kpi-trend">{t("biz_overview.kpi_last30")}</span>
            </div>
          </div>

          <div className="kpi-card kpi-card--accent">
            <span className="kpi-value">85</span>
            <div className="kpi-top">
              <span className="kpi-label">{t("biz_overview.kpi_clicks")}</span>
              <span className="material-symbols-outlined kpi-icon">touch_app</span>
              <span className="kpi-trend">{t("biz_overview.kpi_last30")}</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default BusinessOverview;
