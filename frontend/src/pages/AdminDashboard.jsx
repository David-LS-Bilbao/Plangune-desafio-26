import React, { useState } from "react";
import { useAdminStore, useBusinessStore } from "../store";

function AdminDashboard() {
  const [reviewMessage, setReviewMessage] = useState("");
  const { pendingBusinesses, approveBusiness, rejectBusiness, stats } = useAdminStore();
  const businessOffers = useBusinessStore(state => state.offers);

  const handleApprove = (id) => {
    approveBusiness(id);
    setReviewMessage("El negocio ha sido aprobado.");
    setTimeout(() => setReviewMessage(""), 2000);
  };
  
  const handleReject = (id) => {
    if(window.confirm("¿Estás seguro de rechazar este negocio?")) {
      rejectBusiness(id);
      setReviewMessage("El negocio ha sido rechazado.");
      setTimeout(() => setReviewMessage(""), 2000);
    }
  };

  return (
    <main className="admin-dashboard-main">
      {/* Page Title */}
      <div className="admin-page-header">
        <h2 className="admin-title">Admin TxikiPlan</h2>
        <p className="admin-subtitle">Gestión y moderación del ecosistema.</p>
      </div>

      {/* Bento Grid: High-Level Metrics */}
      <div className="admin-metrics-grid">
        <div className="admin-metric-card">
          <div className="metric-icon bg-secondary-light">
            <span className="material-symbols-outlined">group</span>
          </div>
          <p className="metric-label">Familias</p>
          <p className="metric-number">{stats.activeFamilies}</p>
        </div>

        <div className="admin-metric-card">
          <div className="metric-icon bg-primary-light">
            <span className="material-symbols-outlined">storefront</span>
          </div>
          <p className="metric-label">Negocios</p>
          <p className="metric-number">{stats.activeBusinesses}</p>
        </div>

        <div className="admin-metric-card">
          <div className="metric-icon bg-tertiary-light">
            <span className="material-symbols-outlined">explore</span>
          </div>
          <p className="metric-label">Planes</p>
          <p className="metric-number">{businessOffers.length + 80}</p>
        </div>

        <div className="admin-metric-card">
          <div className="metric-icon bg-error-light">
            <span className="material-symbols-outlined">star_rate</span>
          </div>
          <p className="metric-label">Reseñas</p>
          <p className="metric-number">320</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="admin-content-grid">
        {/* Left Column: Pending Review */}
        <div className="pending-column">
          <div className="section-title-row">
            <h3 className="section-title">Negocios Pendientes</h3>
            <span className="badge-error">{pendingBusinesses.length} Nuevos</span>
          </div>

          <div className="pending-list">
            {pendingBusinesses.length === 0 ? (
              <p className="text-secondary mt-4">No hay negocios pendientes de revisión.</p>
            ) : (
              pendingBusinesses.map((business) => (
                <div className="pending-card" key={business.id}>
                  <div className="pending-card-body">
                    <div className="pending-meta-row">
                      <span className="badge-type">Nuevo Negocio</span>
                      <span className="time-ago">{business.requestDate}</span>
                    </div>
                    <h4 className="pending-title">{business.name}</h4>
                    <p className="pending-by">
                      Email: {business.email}
                    </p>
                  </div>
                  <div className="pending-actions">
                    <button
                      className="btn-reject"
                      type="button"
                      onClick={() => handleReject(business.id)}
                    >
                      Rechazar
                    </button>
                    <button
                      className="btn-approve"
                      type="button"
                      onClick={() => handleApprove(business.id)}
                    >
                      Aprobar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Key Metrics */}
        <div className="metrics-column">
          <h3 className="section-title">Métricas clave</h3>
          <div className="metrics-detail-card">
            {/* Top Filters */}
            <div className="metrics-group">
              <h4 className="metrics-group-title">
                <span className="material-symbols-outlined">filter_alt</span>
                Top Filtros Buscados
              </h4>
              <div className="filter-bars">
                <div className="filter-bar-row">
                  <span className="rank">#1</span>
                  <div className="bar-container">
                    <div className="bar-fill" style={{ width: "85%" }}></div>
                    <span className="bar-label">Cambiador</span>
                  </div>
                  <span className="bar-pct">85%</span>
                </div>
                <div className="filter-bar-row">
                  <span className="rank">#2</span>
                  <div className="bar-container">
                    <div className="bar-fill" style={{ width: "62%" }}></div>
                    <span className="bar-label">Interior</span>
                  </div>
                  <span className="bar-pct">62%</span>
                </div>
                <div className="filter-bar-row">
                  <span className="rank">#3</span>
                  <div className="bar-container">
                    <div className="bar-fill" style={{ width: "45%" }}></div>
                    <span className="bar-label">Gratis</span>
                  </div>
                  <span className="bar-pct">45%</span>
                </div>
              </div>
            </div>

            <hr className="divider-light" />

            {/* Top Zones */}
            <div className="metrics-group">
              <h4 className="metrics-group-title">
                <span className="material-symbols-outlined">map</span>
                Zonas Activas
              </h4>
              <div className="zone-chips">
                <span className="zone-chip">Bilbao</span>
                <span className="zone-chip">Getxo</span>
                <span className="zone-chip">Barakaldo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {reviewMessage && <p className="status-message">{reviewMessage}</p>}
    </main>
  );
}

export default AdminDashboard;
