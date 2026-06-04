import React from 'react';
import { useTranslation } from 'react-i18next';

const KPI_DATA = [
  { label: 'Familias Registradas', value: '842', trend: '+12% este mes', icon: 'group', color: 'secondary' },
  { label: 'Negocios Registrados', value: '156', trend: '+4 este mes', icon: 'storefront', color: 'primary' },
  { label: 'Planes Activos', value: '1,204', trend: '+45 esta semana', icon: 'explore', color: 'tertiary' },
  { label: 'Reseñas Totales', value: '3,450', trend: '4.8 media global', icon: 'star', color: 'yellow' },
  { label: 'Incidencias', value: '12', trend: '3 críticas (Urgent)', icon: 'report_problem', color: 'error', trendError: true },
  { label: 'Actividades Pendientes', value: '28', trend: 'Por moderar', icon: 'pending_actions', color: 'secondary' },
  { label: 'Recomendaciones Gen.', value: '15.2k', trend: '82% CTR', icon: 'psychology', color: 'primary' },
  { label: 'Estrés Fam. Medio', value: 'Medio', trend: 'Moda poblacional', icon: 'stress_management', color: 'dark' },
];

const CATEGORIES = [
  { name: 'Parque al aire libre', pct: 32 },
  { name: 'Museo interactivo', pct: 24 },
  { name: 'Taller creativo', pct: 18 },
  { name: 'Restaurante con zona infantil', pct: 15 },
];

const FILTERS = [
  { name: 'Apto carrito', pct: 45 },
  { name: 'Cambiador', pct: 38 },
  { name: 'Comida cerca', pct: 29 },
  { name: 'A cubierto', pct: 22 },
];

function AdminData() {
  const { t } = useTranslation();
  return (
    <main className="admin-data-main">
      {/* Page Header */}
      <div className="admin-data-header">
        <div>
          <h2 className="data-title">{t('adminData.title', 'Vista General')}</h2>
          <p className="data-subtitle">{t('adminData.subtitle', 'Métricas globales, moderación activa y rendimiento del modelo de recomendación.')}</p>
        </div>
        <div className="header-actions">
          <button className="btn-outline-sm">
            <span className="material-symbols-outlined">calendar_today</span>
            {t('adminData.last30days', 'Últimos 30 días')}
          </button>
          <button className="btn-primary-sm">
            <span className="material-symbols-outlined">download</span>
            {t('adminData.exportCsv', 'Exportar CSV')}
          </button>
        </div>
      </div>

      {/* 1. Top KPI Cards */}
      <div className="kpi-grid-8">
        {KPI_DATA.map((kpi, i) => (
          <div key={i} className="kpi-card-admin">
            <div className={`kpi-icon-row kpi-color-${kpi.color}`}>
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
        {/* Left (2 cols): Analytics */}
        <div className="analytics-left">
          <h3 className="section-title">{t('adminData.searchAnalytics', 'Analítica de Búsqueda')}</h3>
          <div className="charts-pair">
            {/* Categories Bar Chart */}
            <div className="chart-card">
              <h4 className="chart-card-title">{t('adminData.topCategories', 'Categorías más buscadas')}</h4>
              <div className="bar-list">
                {CATEGORIES.map((c, i) => (
                  <div key={i} className="bar-item">
                    <div className="bar-item-header">
                      <span className="bar-name">{c.name}</span>
                      <span className="bar-pct-label text-secondary">{c.pct}%</span>
                    </div>
                    <div className="bar-track">
                      <div className="bar-fill bar-primary" style={{ width: `${c.pct}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Filters Bar Chart */}
            <div className="chart-card">
              <h4 className="chart-card-title">{t('adminData.topFilters', 'Filtros Familiares TOP')}</h4>
              <div className="bar-list">
                {FILTERS.map((f, i) => (
                  <div key={i} className="bar-item">
                    <div className="bar-item-header">
                      <span className="bar-name">{f.name}</span>
                      <span className="bar-pct-label text-secondary">{f.pct}%</span>
                    </div>
                    <div className="bar-track">
                      <div className="bar-fill bar-secondary" style={{ width: `${f.pct}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommender Performance */}
          <div className="chart-card mt-lg">
            <h3 className="section-title mb-4">{t('adminData.recommenderTitle', 'Rendimiento del Recomendador')}</h3>
            <div className="recommender-grid">
              <div className="recommender-stat">
                <p className="recommender-number">8.5k</p>
                <p className="recommender-label">{t('adminData.recommenderLabel', 'Tags "Ideal para tu familia"')}</p>
              </div>
              <div className="recommender-chart">
                <p className="recommender-chart-label">{t('adminData.recommenderChartLabel', 'Pesos de Factores del Modelo (Impacto relativo)')}</p>
                <div className="stacked-bar">
                  <div className="stack-segment bg-primary-container" style={{ width: '35%' }} title="Edad (35%)">EDAD 35%</div>
                  <div className="stack-segment bg-secondary" style={{ width: '25%' }} title="Distancia (25%)">DIST 25%</div>
                  <div className="stack-segment bg-tertiary-container" style={{ width: '20%' }} title="Valoración (20%)">VAL 20%</div>
                  <div className="stack-segment bg-inverse-surface" style={{ width: '15%' }} title="Cambiador (15%)">CAMB 15%</div>
                  <div className="stack-segment bg-outline-variant" style={{ width: '5%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right (1 col): Density Map */}
        <div className="analytics-right">
          <div className="density-card">
            <h3 className="section-title">{t('adminData.densityTitle', 'Densidad de Actividad')}</h3>
            <div className="map-placeholder">
              <span className="material-symbols-outlined map-icon">map</span>
              <p className="map-label">{t('adminData.heatmapLabel', 'Mapa de calor Euskadi')}</p>
              <div className="map-dot red" title="Bilbao"></div>
              <div className="map-dot green md" title="San Sebastián"></div>
              <div className="map-dot green sm" title="Vitoria"></div>
              <div className="map-deficit">
                <p className="deficit-label">{t('adminData.deficitLabel', 'Zonas con deficit de planes:')}</p>
                <span className="deficit-badge">Margen Izquierda (Alta Demanda)</span>
              </div>
            </div>
            <div className="age-chart-section">
              <h4 className="age-chart-label">{t('adminData.ageChartLabel', 'Edad de los peques')}</h4>
              <div className="age-bars">
                <div className="age-bar-col">
                  <div className="age-bar bg-surface-container h-20" title="0-1"></div>
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
                  <div className="age-bar bg-surface-container h-40" title="7-9"></div>
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
        <div className="section-title-row">
          <h3 className="section-title">{t('adminData.moderationTitle', 'Centro de Moderación')}</h3>
          <button className="btn-link-sm">{t('adminData.viewAll', 'Ver todo')}</button>
        </div>
        <div className="moderation-grid">
          {/* Pending Activities */}
          <div className="mod-card">
            <div className="mod-card-header">
              <h4 className="mod-card-title">
                <span className="material-symbols-outlined">pending_actions</span> {t('adminData.pendingActivities', 'Actividades Pendientes')}
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

          {/* Businesses to Validate */}
          <div className="mod-card">
            <div className="mod-card-header">
              <h4 className="mod-card-title">
                <span className="material-symbols-outlined">storefront</span> {t('adminData.businessesToValidate', 'Negocios por Validar')}
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

          {/* Open Incidents */}
          <div className="mod-card">
            <div className="mod-card-header">
              <h4 className="mod-card-title error">
                <span className="material-symbols-outlined">report</span> {t('adminData.openIncidents', 'Incidencias Abiertas')}
              </h4>
              <span className="badge-error-filled">3</span>
            </div>
            <ul className="mod-list">
              <li className="mod-list-item">
                <div className="incident-info">
                  <span className="item-name error">Info desactualizada</span>
                  <span className="incident-desc">"Museo cerrado por obras"</span>
                </div>
                <button className="btn-icon-muted"><span className="material-symbols-outlined">open_in_new</span></button>
              </li>
              <li className="mod-list-item">
                <div className="incident-info">
                  <span className="item-name">Falta accesibilidad real</span>
                  <span className="incident-desc">"No se puede entrar con carrito gemelar"</span>
                </div>
                <button className="btn-icon-muted"><span className="material-symbols-outlined">open_in_new</span></button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 4. Top Performance Table */}
      <div className="top-performance-section">
        <h3 className="section-title">{t('adminData.topPerformance', 'Top Rendimiento')}</h3>
        <div className="data-table-wrapper">
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('adminData.topFamilyPlans', 'Top Planes Familiares')}</th>
                  <th>{t('adminData.category', 'Categoría')}</th>
                  <th className="text-center">{t('adminData.saved', 'Guardados')}</th>
                  <th className="text-center">{t('adminData.rating', 'Valoración')}</th>
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
