import React, { useState } from "react";

function BusinessPerformance() {
  const [showFullReport, setShowFullReport] = useState(false);

  return (
    <main className="business-performance-main">
      <div className="performance-header">
        <h2 className="performance-title">Resumen de Rendimiento</h2>
        <p className="performance-subtitle">
          Consulta el impacto de tus actividades y ofertas en los últimos 30
          días.
        </p>
      </div>

      {/* BENTO GRID: METRICS */}
      <div className="metrics-grid">
        {/* KPI 1: Visualizaciones */}
        <div className="metric-card">
          <div className="metric-header">
            <span className="material-symbols-outlined icon-secondary">
              visibility
            </span>
            <div className="trend-badge positive">
              <span className="material-symbols-outlined text-sm">
                trending_up
              </span>
              <span>+12%</span>
            </div>
          </div>
          <div className="metric-content">
            <h3 className="metric-label">Visualizaciones</h3>
            <p className="metric-value">1,245</p>
          </div>
        </div>

        {/* KPI 2: Clics */}
        <div className="metric-card">
          <div className="metric-header">
            <span className="material-symbols-outlined icon-primary">
              ads_click
            </span>
            <div className="trend-badge positive">
              <span className="material-symbols-outlined text-sm">
                trending_up
              </span>
              <span>+8%</span>
            </div>
          </div>
          <div className="metric-content">
            <h3 className="metric-label">Clics en Ofertas</h3>
            <p className="metric-value">342</p>
          </div>
        </div>

        {/* KPI 3: Guardadas */}
        <div className="metric-card">
          <div className="metric-header">
            <span className="material-symbols-outlined icon-tertiary">
              bookmark
            </span>
            <div className="trend-badge positive">
              <span className="material-symbols-outlined text-sm">
                trending_up
              </span>
              <span>+15%</span>
            </div>
          </div>
          <div className="metric-content">
            <h3 className="metric-label">Ofertas Guardadas</h3>
            <p className="metric-value">89</p>
          </div>
        </div>

        {/* KPI 4: Valoración */}
        <div className="metric-card gradient">
          <div className="metric-header">
            <span className="material-symbols-outlined icon-star fill">
              star
            </span>
            <span className="badge-neutral">Media Global</span>
          </div>
          <div className="metric-content">
            <h3 className="metric-label">Valoración Media</h3>
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
            <h3 className="chart-title">Interacción Semanal</h3>
            <button
              className="btn-link-sm"
              type="button"
              onClick={() => setShowFullReport(true)}
            >
              Ver reporte completo
            </button>
          </div>
          {showFullReport && (
            <div className="report-note">
              <p>
                Mostrando datos extendidos y recomendaciones de optimización.
              </p>
            </div>
          )}

          {/* CSS Bar Chart Representation */}
          <div className="bar-chart-container">
            <div className="chart-bar-group">
              <div className="bar bg-variant h-40">
                <div className="tooltip">120</div>
              </div>
              <span className="bar-label">Lun</span>
            </div>
            <div className="chart-bar-group">
              <div className="bar bg-variant h-60">
                <div className="tooltip">180</div>
              </div>
              <span className="bar-label">Mar</span>
            </div>
            <div className="chart-bar-group">
              <div className="bar bg-variant h-45">
                <div className="tooltip">135</div>
              </div>
              <span className="bar-label">Mié</span>
            </div>
            <div className="chart-bar-group">
              <div className="bar bg-variant h-80">
                <div className="tooltip">240</div>
              </div>
              <span className="bar-label">Jue</span>
            </div>
            <div className="chart-bar-group">
              <div className="bar bg-primary h-95 shadow-glow">
                <div className="tooltip active">285</div>
              </div>
              <span className="bar-label primary-bold">Vie</span>
            </div>
            <div className="chart-bar-group">
              <div className="bar bg-variant h-70">
                <div className="tooltip">210</div>
              </div>
              <span className="bar-label">Sáb</span>
            </div>
            <div className="chart-bar-group">
              <div className="bar bg-variant h-50">
                <div className="tooltip">150</div>
              </div>
              <span className="bar-label">Dom</span>
            </div>
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="reviews-section-small">
          <div className="reviews-header">
            <h3 className="reviews-title">Reseñas Recientes</h3>
          </div>
          <div className="reviews-list">
            {/* Review 1 */}
            <div className="review-item">
              <div className="review-author-row">
                <div className="author-avatar bg-secondary-container">M</div>
                <div className="author-details">
                  <p className="author-name">Marta L.</p>
                  <div className="review-stars">
                    <span className="material-symbols-outlined fill">star</span>
                    <span className="material-symbols-outlined fill">star</span>
                    <span className="material-symbols-outlined fill">star</span>
                    <span className="material-symbols-outlined fill">star</span>
                    <span className="material-symbols-outlined fill">star</span>
                  </div>
                </div>
              </div>
              <p className="review-text">
                "El taller de cerámica fue increíble, los niños se lo pasaron
                genial. Muy bien organizado."
              </p>
            </div>

            {/* Review 2 */}
            <div className="review-item">
              <div className="review-author-row">
                <div className="author-avatar bg-primary-container">J</div>
                <div className="author-details">
                  <p className="author-name">Javier G.</p>
                  <div className="review-stars">
                    <span className="material-symbols-outlined fill">star</span>
                    <span className="material-symbols-outlined fill">star</span>
                    <span className="material-symbols-outlined fill">star</span>
                    <span className="material-symbols-outlined fill">star</span>
                    <span className="material-symbols-outlined">star_half</span>
                  </div>
                </div>
              </div>
              <p className="review-text">
                "Buen precio usando la oferta de la app. El local estaba un poco
                lleno, pero la atención fue rápida."
              </p>
            </div>

            {/* Review 3 */}
            <div className="review-item border-none">
              <div className="review-author-row">
                <div className="author-avatar bg-surface-dim">A</div>
                <div className="author-details">
                  <p className="author-name">Ane E.</p>
                  <div className="review-stars">
                    <span className="material-symbols-outlined fill">star</span>
                    <span className="material-symbols-outlined fill">star</span>
                    <span className="material-symbols-outlined fill">star</span>
                    <span className="material-symbols-outlined fill">star</span>
                    <span className="material-symbols-outlined fill">star</span>
                  </div>
                </div>
              </div>
              <p className="review-text">
                "Instalaciones muy limpias y adaptadas para carritos. Volveremos
                seguro el próximo fin de semana."
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default BusinessPerformance;
