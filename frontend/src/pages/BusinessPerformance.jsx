import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

function BusinessPerformance() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showFullReport, setShowFullReport] = useState(false);

  return (
    <main className="business-performance-main">
      <div className="performance-header">
        <h2 className="performance-title">{t("biz_performance.title")}</h2>
        <div className="btn-back-wrapper">
          <button type="button" className="btn-text-danger" onClick={() => navigate(-1)}>
            {t("plan_detail.back")}
          </button>
        </div>
      </div>

      {/* BENTO GRID: METRICS */}
      <div className="metrics-grid">
        {/* KPI 1: Visualizaciones */}
        <div className="metric-card">
          <div className="metric-header">
            <span className="material-symbols-outlined icon-secondary">visibility</span>
            <div className="trend-badge positive">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              <span>+12%</span>
            </div>
          </div>
          <div className="metric-content">
            <h3 className="metric-label">{t("biz_performance.kpi_views")}</h3>
            <p className="metric-value">1,245</p>
          </div>
        </div>

        {/* KPI 2: Clics */}
        <div className="metric-card">
          <div className="metric-header">
            <span className="material-symbols-outlined icon-primary">ads_click</span>
            <div className="trend-badge positive">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              <span>+8%</span>
            </div>
          </div>
          <div className="metric-content">
            <h3 className="metric-label">{t("biz_performance.kpi_clicks")}</h3>
            <p className="metric-value">342</p>
          </div>
        </div>

        {/* KPI 3: Guardadas */}
        <div className="metric-card">
          <div className="metric-header">
            <span className="material-symbols-outlined icon-tertiary">bookmark</span>
            <div className="trend-badge positive">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              <span>+15%</span>
            </div>
          </div>
          <div className="metric-content">
            <h3 className="metric-label">{t("biz_performance.kpi_saved")}</h3>
            <p className="metric-value">89</p>
          </div>
        </div>

        {/* KPI 4: Valoración */}
        <div className="metric-card">
          <div className="metric-header">
            <span className="material-symbols-outlined icon-star fill">star</span>
            <span className="badge-neutral">{t("biz_performance.kpi_rating_badge")}</span>
          </div>
          <div className="metric-content">
            <h3 className="metric-label">{t("biz_performance.kpi_rating")}</h3>
            <div className="rating-value">
              <p className="metric-value">4.8</p>
              <p className="rating-max">/ 5</p>
            </div>
          </div>
        </div>
      </div>

      {/* BENTO GRID: CHARTS & REVIEWS */}
      <div className="charts-reviews-grid">
        {/* Chart Area */}
        <div className="chart-section col-span-2">
          <div className="chart-header">
            <h3 className="chart-title">{t("biz_performance.chart_title")}</h3>
            <button
              className="btn-link-sm"
              type="button"
              onClick={() => setShowFullReport(true)}
            >
              {t("biz_performance.chart_full_report")}
            </button>
          </div>
          {showFullReport && (
            <div className="report-note">
              <p>{t("biz_performance.chart_report_note")}</p>
            </div>
          )}

          {/* CSS Bar Chart Representation */}
          <div className="bar-chart-container">
            <div className="chart-bar-group">
              <div className="bar bg-variant h-40"><div className="tooltip">120</div></div>
              <span className="bar-label">{t("biz_performance.day_lun")}</span>
            </div>
            <div className="chart-bar-group">
              <div className="bar bg-variant h-60"><div className="tooltip">180</div></div>
              <span className="bar-label">{t("biz_performance.day_mar")}</span>
            </div>
            <div className="chart-bar-group">
              <div className="bar bg-variant h-45"><div className="tooltip">135</div></div>
              <span className="bar-label">{t("biz_performance.day_mie")}</span>
            </div>
            <div className="chart-bar-group">
              <div className="bar bg-variant h-80"><div className="tooltip">240</div></div>
              <span className="bar-label">{t("biz_performance.day_jue")}</span>
            </div>
            <div className="chart-bar-group">
              <div className="bar bg-primary h-95 shadow-glow"><div className="tooltip active">285</div></div>
              <span className="bar-label primary-bold">{t("biz_performance.day_vie")}</span>
            </div>
            <div className="chart-bar-group">
              <div className="bar bg-variant h-70"><div className="tooltip">210</div></div>
              <span className="bar-label">{t("biz_performance.day_sab")}</span>
            </div>
            <div className="chart-bar-group">
              <div className="bar bg-variant h-50"><div className="tooltip">150</div></div>
              <span className="bar-label">{t("biz_performance.day_dom")}</span>
            </div>
          </div>
        </div>

        {/* Recent Reviews — texto de las reseñas sin traducir */}
        <div className="reviews-section-small">
          <div className="reviews-header">
            <h3 className="reviews-title">{t("biz_performance.reviews_title")}</h3>
          </div>
          <div className="reviews-list">
            <div className="review-item">
              <div className="review-author-row">
                <div className="author-avatar bg-secondary-container">M</div>
                <div className="author-details">
                  <p className="author-name">Marta L.</p>
                  <div className="review-stars">
                    <span className="review-rating-number">5.0</span>
                    <span className="material-symbols-outlined fill">star</span>
                    <span className="material-symbols-outlined fill">star</span>
                    <span className="material-symbols-outlined fill">star</span>
                    <span className="material-symbols-outlined fill">star</span>
                    <span className="material-symbols-outlined fill">star</span>
                  </div>
                </div>
              </div>
              <p className="review-text">
                "El taller de cerámica fue increíble, los niños se lo pasaron genial. Muy bien organizado."
              </p>
            </div>

            <div className="review-item">
              <div className="review-author-row">
                <div className="author-avatar bg-primary-container">J</div>
                <div className="author-details">
                  <p className="author-name">Javier G.</p>
                  <div className="review-stars">
                    <span className="review-rating-number">4.5</span>
                    <span className="material-symbols-outlined fill">star</span>
                    <span className="material-symbols-outlined fill">star</span>
                    <span className="material-symbols-outlined fill">star</span>
                    <span className="material-symbols-outlined fill">star</span>
                    <span className="material-symbols-outlined">star_half</span>
                  </div>
                </div>
              </div>
              <p className="review-text">
                "Buen precio usando la oferta de la app. El local estaba un poco lleno, pero la atención fue rápida."
              </p>
            </div>

            <div className="review-item border-none">
              <div className="review-author-row">
                <div className="author-avatar bg-surface-dim">A</div>
                <div className="author-details">
                  <p className="author-name">Ane E.</p>
                  <div className="review-stars">
                    <span className="review-rating-number">5.0</span>
                    <span className="material-symbols-outlined fill">star</span>
                    <span className="material-symbols-outlined fill">star</span>
                    <span className="material-symbols-outlined fill">star</span>
                    <span className="material-symbols-outlined fill">star</span>
                    <span className="material-symbols-outlined fill">star</span>
                  </div>
                </div>
              </div>
              <p className="review-text">
                "Instalaciones muy limpias y adaptadas para carritos. Volveremos seguro el próximo fin de semana."
              </p>
            </div>
          </div>

          <button
            type="button"
            className="reviews-see-more"
            onClick={() => navigate("/negocio/resenas")}
          >
            {t("biz_performance.reviews_see_more")}
          </button>
        </div>
      </div>
    </main>
  );
}

export default BusinessPerformance;
