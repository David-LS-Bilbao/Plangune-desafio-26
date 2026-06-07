import React from "react";
import { useNavigate } from "react-router-dom";
import { useBusinessStore } from "../store";

function BusinessOverview() {
  const navigate = useNavigate();
  const { offers, stats } = useBusinessStore();

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
          className="action-card primary"
          type="button"
          onClick={() => navigate("/negocio")}
        >
          <div className="action-icon">
            <span className="material-symbols-outlined fill">add_circle</span>
          </div>
          <h3 className="action-title">
            Gestionar
            <br />
            actividad
          </h3>
        </button>

        {/* Action 2: Secondary Focus */}
        <button
          className="action-card secondary"
          type="button"
          onClick={() => navigate("/negocio/ofertas")}
        >
          <div className="action-icon">
            <span className="material-symbols-outlined">sell</span>
          </div>
          <h3 className="action-title">
            Gestionar
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
            Plan de
            <br />
            visibilidad
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
            Planes
            <br />
            de pago
          </h3>
        </button>

        {/* Action 5: Utility */}
        <button
          className="action-card utility"
          type="button"
          onClick={() => navigate("/negocio/resenas")}
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

        {/* Action 6: Utility */}
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
      </section>

      {/* KPIs Section */}
      <section className="kpis-section">
        <div className="kpis-header">
          <h3 className="kpis-title">Rendimiento Actual</h3>
          <div className="btn-link-wrapper">
            <button
              className="btn-link"
              type="button"
              onClick={() => navigate("/negocio/rendimiento")}
            >
              Ver informe detallado
            </button>
          </div>
        </div>

        <div className="kpis-grid">
          <div className="kpi-card">
            <span className="kpi-value">{offers.length}</span>
            <div className="kpi-top">
              <span className="kpi-label">Actividades publicadas</span>
              <span className="material-symbols-outlined kpi-icon fill">event_available</span>
            </div>
          </div>

          <div className="kpi-card">
            <span className="kpi-value">1</span>
            <div className="kpi-top">
              <span className="kpi-label">Ofertas en activo</span>
              <span className="material-symbols-outlined kpi-icon fill">local_offer</span>
            </div>
          </div>

          <div className="kpi-card">
            <span className="kpi-value">1</span>
            <div className="kpi-top">
              <span className="kpi-label">Pendientes revisión</span>
              <span className="material-symbols-outlined kpi-icon">pending_actions</span>
            </div>
          </div>

          <div className="kpi-card kpi-card--accent">
            <span className="kpi-value">12</span>
            <div className="kpi-top">
              <span className="kpi-label">Reseñas</span>
              <span className="material-symbols-outlined kpi-icon fill">star_rate</span>
              <span className="kpi-trend">+2 esta semana</span>
            </div>
          </div>

          <div className="kpi-card kpi-card--accent">
            <span className="kpi-value">1.2k</span>
            <div className="kpi-top">
              <span className="kpi-label">Vistas</span>
              <span className="material-symbols-outlined kpi-icon">visibility</span>
              <span className="kpi-trend">Últimos 30 días</span>
            </div>
          </div>

          <div className="kpi-card kpi-card--accent">
            <span className="kpi-value">85</span>
            <div className="kpi-top">
              <span className="kpi-label">Clics en ofertas</span>
              <span className="material-symbols-outlined kpi-icon">touch_app</span>
              <span className="kpi-trend">Últimos 30 días</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default BusinessOverview;
