import React from 'react';
import { useTranslation } from 'react-i18next';

const BAR_COLORS = ['bar-primary', 'bar-secondary', 'bar-tertiary', 'bar-accent'];

function AdminData() {
  const { t } = useTranslation();

  const KPI_DATA = [
    { label: t("admin_data.kpi_families"),  value: '842',   trend: t("admin_data.kpi_families_trend"),  icon: 'group' },
    { label: t("admin_data.kpi_businesses"), value: '156',  trend: t("admin_data.kpi_businesses_trend"), icon: 'storefront' },
    { label: t("admin_data.kpi_plans"),      value: '1,204', trend: t("admin_data.kpi_plans_trend"),     icon: 'explore' },
    { label: t("admin_data.kpi_reviews"),    value: '3,450', trend: t("admin_data.kpi_reviews_trend"),   icon: 'star' },
    { label: t("admin_data.kpi_incidents"),  value: '12',   trend: t("admin_data.kpi_incidents_trend"), icon: 'report_problem', trendError: true },
    { label: t("admin_data.kpi_pending"),    value: '28',   trend: t("admin_data.kpi_pending_trend"),   icon: 'pending_actions' },
    { label: t("admin_data.kpi_recs"),       value: '15.2k', trend: t("admin_data.kpi_recs_trend"),     icon: 'psychology' },
    { label: t("admin_data.kpi_stress"),     value: t("admin_data.kpi_stress_value"), trend: t("admin_data.kpi_stress_trend"), icon: 'stress_management' },
  ];

  const CATEGORIES = [
    { name: t("admin_data.cat_park"),       pct: 32 },
    { name: t("admin_data.cat_museum"),     pct: 24 },
    { name: t("admin_data.cat_workshop"),   pct: 18 },
    { name: t("admin_data.cat_restaurant"), pct: 15 },
  ];

  const FILTERS = [
    { name: t("admin_data.filter_stroller"), pct: 45 },
    { name: t("admin_data.filter_changer"),  pct: 38 },
    { name: t("admin_data.filter_food"),     pct: 29 },
    { name: t("admin_data.filter_covered"),  pct: 22 },
  ];

  return (
    <main className="admin-data-main">
      <div className="admin-data-header">
        <div>
          <h2 className="data-title">{t("admin_data.title")}</h2>
          <p className="data-subtitle">{t("admin_data.subtitle")}</p>
        </div>
        <div className="header-actions">
          <button className="btn-outline-sm">
            <span className="material-symbols-outlined">calendar_today</span>
            {t("admin_data.btn_last30")}
          </button>
          <button className="btn-primary-sm">
            <span className="material-symbols-outlined">download</span>
            {t("admin_data.btn_export")}
          </button>
        </div>
      </div>

      {/* 1. Top KPI Cards */}
      <div className="kpi-grid-8">
        {KPI_DATA.map((kpi, i) => (
          <div key={i} className="kpi-card-admin">
            <div className="kpi-icon-row">
              <span className="material-symbols-outlined">{kpi.icon}</span>
              <h3 className="kpi-label-sm">{kpi.label}</h3>
            </div>
            <p className="kpi-number">{kpi.value}</p>
            <p className={`kpi-trend ${kpi.trendError ? 'error' : 'positive'}`}>
              <span className="material-symbols-outlined">{kpi.trendError ? 'warning' : 'trending_up'}</span>
              {kpi.trend}
            </p>
          </div>
        ))}
      </div>

      {/* 2. Charts & Density + Recommender */}
      <div className="analytics-grid">
        <div className="analytics-left">
          <div className="analytics-search-card">
            <h3 className="section-title">{t("admin_data.search_analytics_title")}</h3>
            <div className="charts-pair">
              <div className="chart-card">
                <h4 className="chart-card-title">{t("admin_data.categories_chart_title")}</h4>
                <div className="bar-list">
                  {CATEGORIES.map((c, i) => (
                    <div key={i} className="bar-item">
                      <div className="bar-item-header">
                        <span className="bar-name">{c.name}</span>
                        <span className="bar-pct-label text-secondary">{c.pct}%</span>
                      </div>
                      <div className="bar-track">
                        <div className={`bar-fill ${BAR_COLORS[i % BAR_COLORS.length]}`} style={{ width: `${c.pct}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="chart-card">
                <h4 className="chart-card-title">{t("admin_data.filters_chart_title")}</h4>
                <div className="bar-list">
                  {FILTERS.map((f, i) => (
                    <div key={i} className="bar-item">
                      <div className="bar-item-header">
                        <span className="bar-name">{f.name}</span>
                        <span className="bar-pct-label text-secondary">{f.pct}%</span>
                      </div>
                      <div className="bar-track">
                        <div className={`bar-fill ${BAR_COLORS[i % BAR_COLORS.length]}`} style={{ width: `${f.pct}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="chart-card mt-lg">
            <h3 className="section-title mb-4">{t("admin_data.recommender_title")}</h3>
            <div className="recommender-grid">
              <div className="recommender-stat">
                <p className="recommender-number">8.5k</p>
                <p className="recommender-label">{t("admin_data.recommender_ideal_label")}</p>
              </div>
              <div className="recommender-chart">
                <p className="recommender-chart-label">{t("admin_data.recommender_chart_label")}</p>
                <div className="stacked-bar">
                  <div className="stack-segment bg-primary-container" style={{ width: '35%' }} title="Edad (35%)">{t("admin_data.recommender_age")} 35%</div>
                  <div className="stack-segment bg-secondary" style={{ width: '25%' }} title="Distancia (25%)">{t("admin_data.recommender_dist")} 25%</div>
                  <div className="stack-segment bg-tertiary-container" style={{ width: '20%' }} title="Valoración (20%)">{t("admin_data.recommender_rating")} 20%</div>
                  <div className="stack-segment bg-inverse-surface" style={{ width: '15%' }} title="Cambiador (15%)">{t("admin_data.recommender_changer")} 15%</div>
                  <div className="stack-segment bg-outline-variant" style={{ width: '5%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="analytics-right">
          <div className="density-card">
            <h3 className="section-title">{t("admin_data.density_title")}</h3>
            <div className="map-placeholder">
              <span className="material-symbols-outlined map-icon">map</span>
              <p className="map-label">{t("admin_data.density_map_label")}</p>
              <div className="map-dot red" title="Bilbao"></div>
              <div className="map-dot green md" title="San Sebastián"></div>
              <div className="map-dot green sm" title="Vitoria"></div>
              <div className="map-deficit">
                <p className="deficit-label">{t("admin_data.density_deficit_label")}</p>
                <span className="deficit-badge">{t("admin_data.density_deficit_zone")}</span>
              </div>
            </div>
            <div className="age-chart-section">
              <h4 className="age-chart-label">{t("admin_data.age_chart_label")}</h4>
              <div className="age-bars">
                <div className="age-bar-col">
                  <div className="age-bar bg-accent h-20" title="0-1"></div>
                  <span className="age-label">0-1</span>
                </div>
                <div className="age-bar-col">
                  <div className="age-bar bg-primary-container h-60" title="1-3"></div>
                  <span className="age-label">1-3</span>
                </div>
                <div className="age-bar-col">
                  <div className="age-bar bg-secondary h-full" title="4-6"></div>
                  <span className="age-label">4-6</span>
                </div>
                <div className="age-bar-col">
                  <div className="age-bar bg-tertiary-container h-40" title="7-9"></div>
                  <span className="age-label">7-9</span>
                </div>
                <div className="age-bar-col">
                  <div className="age-bar bg-surface-container h-10" title="10+"></div>
                  <span className="age-label">10+</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Moderation Centre */}
      <div className="moderation-section">
        <div className="moderation-card">
          <div className="section-title-row">
            <h3 className="section-title">{t("admin_data.moderation_title")}</h3>
            <button className="btn-link-sm">{t("admin_data.moderation_see_all")}</button>
          </div>
          <div className="moderation-grid">
            <div className="mod-card">
              <div className="mod-card-header">
                <h4 className="mod-card-title">
                  <span className="material-symbols-outlined">pending_actions</span> {t("admin_data.mod_pending_title")}
                </h4>
                <span className="badge-neutral-sm">28</span>
              </div>
              <ul className="mod-list">
                {['Taller de Barro Creativo', 'Cuentacuentos en euskera', 'Ruta Txiki Mendia'].map((item, i) => (
                  <li key={i} className="mod-list-item">
                    <span className="item-name">{item}</span>
                    <button className="btn-icon-primary"><span className="material-symbols-outlined">visibility</span></button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mod-card">
              <div className="mod-card-header">
                <h4 className="mod-card-title">
                  <span className="material-symbols-outlined">storefront</span> {t("admin_data.mod_businesses_title")}
                </h4>
                <span className="badge-error-sm">5</span>
              </div>
              <ul className="mod-list">
                {['Ludoteca Txikitxu', 'Café Monstruos', 'Granja Escuela Bizkaia'].map((item, i) => (
                  <li key={i} className="mod-list-item">
                    <span className="item-name">{item}</span>
                    <button className="btn-icon-primary"><span className="material-symbols-outlined">verified</span></button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mod-card">
              <div className="mod-card-header">
                <h4 className="mod-card-title error">
                  <span className="material-symbols-outlined">report</span> {t("admin_data.mod_incidents_title")}
                </h4>
                <span className="badge-error-filled">3</span>
              </div>
              <ul className="mod-list">
                <li className="mod-list-item">
                  <div className="incident-info">
                    <span className="item-name error">{t("admin_data.incident_outdated")}</span>
                    <span className="incident-desc">"Museo cerrado por obras"</span>
                  </div>
                  <button className="btn-icon-muted"><span className="material-symbols-outlined">open_in_new</span></button>
                </li>
                <li className="mod-list-item">
                  <div className="incident-info">
                    <span className="item-name">{t("admin_data.incident_accessibility")}</span>
                    <span className="incident-desc">"No se puede entrar con carrito gemelar"</span>
                  </div>
                  <button className="btn-icon-muted"><span className="material-symbols-outlined">open_in_new</span></button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Top Performance Table */}
      <div className="top-performance-section">
        <h3 className="section-title">{t("admin_data.top_performance_title")}</h3>
        <div className="data-table-wrapper">
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t("admin_data.table_col_plan")}</th>
                  <th>{t("admin_data.table_col_category")}</th>
                  <th className="text-center">{t("admin_data.table_col_saved")}</th>
                  <th className="text-center">{t("admin_data.table_col_rating")}</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Guggenheim Txiki', 'Museo interactivo', '1,245', '4.9'],
                  ['Parque Doña Casilda (Zona columpios)', 'Parque al aire libre', '980', '4.7'],
                  ['Ruta Bosque Animado Oma', 'Naturaleza', '850', '4.8'],
                ].map(([name, cat, saved, rating], i) => (
                  <tr key={i} className="table-row">
                    <td className="cell-bold">{name}</td>
                    <td>{cat}</td>
                    <td className="text-center">{saved}</td>
                    <td className="text-center rating-cell">
                      <span className="material-symbols-outlined fill text-tertiary-container">star</span> {rating}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}

export default AdminData;
