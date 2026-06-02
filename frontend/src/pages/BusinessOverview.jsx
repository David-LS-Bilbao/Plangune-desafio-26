import React from "react";
import { useNavigate } from "react-router-dom";

function BusinessOverview() {
  const navigate = useNavigate();

  return (
    <main className="business-overview-main">
      {/* Welcome Section */}
      <section className="overview-header">
        <h2 className="overview-title">Hola, Gestión Local</h2>
        <p className="overview-subtitle">
          Aquí tienes un resumen del impacto de tus planes familiares.
        </p>
      </section>

      {/* Quick Actions (Bento Box style) */}
      <section className="quick-actions-grid">
        {/* Action 1: Primary Prominent */}
        <button
          className="action-card primary col-span-2 md:col-span-1"
          type="button"
          onClick={() => navigate("/negocio")}
        >
          <div className="action-icon">
            <span className="material-symbols-outlined fill">add_circle</span>
          </div>
          <h3 className="action-title">
            Crear
            <br />
            actividad
          </h3>
        </button>

        {/* Action 2: Secondary Focus */}
        <button
          className="action-card secondary"
          type="button"
          onClick={() => navigate("/negocio/crear-oferta")}
        >
          <div className="action-icon">
            <span className="material-symbols-outlined">sell</span>
          </div>
          <h3 className="action-title">
            Crear
            <br />
            oferta
          </h3>
        </button>

        {/* Action 3: Utility */}
        <button
          className="action-card utility"
          type="button"
          onClick={() => navigate("/negocio/estrategia")}
        >
          <div className="action-icon-utility text-primary">
            <span className="material-symbols-outlined">insights</span>
          </div>
          <h3 className="action-title-utility">
            Mi
            <br />
            estrategia
          </h3>
        </button>

        {/* Action 4: Utility */}
        <button
          className="action-card utility"
          type="button"
          onClick={() => navigate("/negocio/suscripciones")}
        >
          <div className="action-icon-utility text-primary">
            <span className="material-symbols-outlined">payments</span>
          </div>
          <h3 className="action-title-utility">
            Suscripciones
            <br />
            de pago
          </h3>
        </button>

        {/* Action 5: Utility */}
        <button
          className="action-card utility"
          type="button"
          onClick={() => navigate("/negocio/perfil")}
        >
          <div className="action-icon-utility text-primary">
            <span className="material-symbols-outlined">edit</span>
          </div>
          <h3 className="action-title-utility">
            Editar
            <br />
            perfil
          </h3>
        </button>

        {/* Action 6: Utility */}
        <button
          className="action-card utility"
          type="button"
          onClick={() => navigate("/negocio/rendimiento")}
        >
          <div className="action-icon-utility text-primary">
            <span className="material-symbols-outlined">reviews</span>
          </div>
          <h3 className="action-title-utility">
            Ver
            <br />
            reseñas
          </h3>
        </button>
      </section>

      {/* KPIs Section */}
      <section className="kpis-section">
        <div className="kpis-header">
          <h3 className="kpis-title">Rendimiento Actual</h3>
          <button
            className="btn-link"
            type="button"
            onClick={() => navigate("/negocio/rendimiento")}
          >
            Ver informe detallado
            <span className="material-symbols-outlined text-sm">
              arrow_forward
            </span>
          </button>
        </div>

        <div className="kpis-grid">
          {/* KPI 1 */}
          <div className="kpi-card">
            <div className="kpi-bg-accent primary"></div>
            <div className="kpi-header z-10">
              <div className="kpi-icon bg-primary-light text-primary">
                <span className="material-symbols-outlined fill">
                  event_available
                </span>
              </div>
              <span className="kpi-label">Activas</span>
            </div>
            <div className="kpi-value-row z-10">
              <span className="kpi-value">2</span>
              <span className="kpi-subtext">Actividades</span>
            </div>
          </div>

          {/* KPI 2 */}
          <div className="kpi-card">
            <div className="kpi-bg-accent secondary"></div>
            <div className="kpi-header z-10">
              <div className="kpi-icon bg-secondary-light text-on-secondary-container">
                <span className="material-symbols-outlined fill">
                  local_offer
                </span>
              </div>
              <span className="kpi-label">Activas</span>
            </div>
            <div className="kpi-value-row z-10">
              <span className="kpi-value">1</span>
              <span className="kpi-subtext">Ofertas</span>
            </div>
          </div>

          {/* KPI 3 */}
          <div className="kpi-card">
            <div className="kpi-bg-accent tertiary"></div>
            <div className="kpi-header z-10">
              <div className="kpi-icon bg-surface-variant text-on-surface">
                <span className="material-symbols-outlined">
                  pending_actions
                </span>
              </div>
              <span className="kpi-label">Revisión</span>
            </div>
            <div className="kpi-value-row z-10">
              <span className="kpi-value">1</span>
              <span className="kpi-subtext">Pendiente</span>
            </div>
          </div>

          {/* KPI 4 */}
          <div className="kpi-card">
            <div className="kpi-header z-10">
              <div className="kpi-icon bg-yellow-light text-tertiary-container">
                <span className="material-symbols-outlined fill">
                  star_rate
                </span>
              </div>
              <span className="kpi-label">Reseñas</span>
            </div>
            <div className="kpi-value-row z-10">
              <span className="kpi-value">12</span>
              <span className="kpi-subtext text-primary flex items-center">
                +2 esta semana
              </span>
            </div>
          </div>

          {/* KPI 5 */}
          <div className="kpi-card">
            <div className="kpi-header z-10">
              <div className="kpi-icon bg-surface-high text-on-surface">
                <span className="material-symbols-outlined">visibility</span>
              </div>
              <span className="kpi-label">Vistas</span>
            </div>
            <div className="kpi-value-row z-10">
              <span className="kpi-value">1.2k</span>
              <span className="kpi-subtext">Últimos 30 días</span>
            </div>
          </div>

          {/* KPI 6 */}
          <div className="kpi-card">
            <div className="kpi-header z-10">
              <div className="kpi-icon bg-surface-high text-on-surface">
                <span className="material-symbols-outlined">touch_app</span>
              </div>
              <span className="kpi-label">Clics Ofertas</span>
            </div>
            <div className="kpi-value-row z-10">
              <span className="kpi-value">85</span>
              <span className="kpi-subtext">Últimos 30 días</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default BusinessOverview;
