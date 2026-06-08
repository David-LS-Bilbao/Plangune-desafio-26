import React, { useState, useEffect } from "react";
import { useAdminStore, useBusinessStore } from "../store";

function AdminDashboard() {
  const [reviewMessage, setReviewMessage] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const { pendingBusinesses, approveBusiness, rejectBusiness, stats, fetchAdminData, isLoading } = useAdminStore();
  const businessOffers = useBusinessStore(state => state.offers);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const handleApprove = async (id) => {
    setProcessingId(id);
    await approveBusiness(id);
    setProcessingId(null);
    setReviewMessage("El negocio ha sido aprobado.");
    setTimeout(() => setReviewMessage(""), 2000);
  };
  
  const handleReject = async (id) => {
    if(window.confirm("¿Estás seguro de rechazar este negocio?")) {
      setProcessingId(id);
      await rejectBusiness(id);
      setProcessingId(null);
      setReviewMessage("El negocio ha sido rechazado.");
      setTimeout(() => setReviewMessage(""), 2000);
    }
  };

  if (isLoading) {
    return <main className="admin-dashboard-main"><p>Cargando datos de administración...</p></main>;
  }

  return (
    <main className="admin-dashboard-main">
      {/* Page Title */}
      <div className="admin-page-header">
        <h2 className="admin-title">Dashboard de administración</h2>
        <p className="admin-subtitle">Gestión y moderación del ecosistema.</p>
      </div>

      {/* Bento Grid: High-Level Metrics */}
      <div className="admin-metrics-grid">
        <div className="admin-metric-card">
          <div className="metric-icon bg-secondary-light">
            <span className="material-symbols-outlined">group</span>
          </div>
          <div className="metric-text">
            <p className="metric-label">Familias</p>
            <p className="metric-number">{stats.activeFamilies}</p>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="metric-icon bg-secondary-light">
            <span className="material-symbols-outlined">storefront</span>
          </div>
          <div className="metric-text">
            <p className="metric-label">Negocios</p>
            <p className="metric-number">{stats.activeBusinesses}</p>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="metric-icon bg-secondary-light">
            <span className="material-symbols-outlined">explore</span>
          </div>
          <div className="metric-text">
            <p className="metric-label">Planes</p>
            <p className="metric-number">{businessOffers.length + 80}</p>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="metric-icon bg-secondary-light">
            <span className="material-symbols-outlined">star_rate</span>
          </div>
          <div className="metric-text">
            <p className="metric-label">Reseñas</p>
            <p className="metric-number">320</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="admin-content-grid">
        {/* Left Column: Pending Review */}
        <div className="pending-column">
          <div className="section-title-row">
            <h3 className="section-title">Negocios pendientes</h3>
          </div>

          <div className="pending-list">
            {pendingBusinesses.length === 0 ? (
              <p className="text-secondary mt-4">No hay negocios pendientes de revisión.</p>
            ) : (
              pendingBusinesses.map((business) => (
                <div className="pending-card" key={business.id}>
                  <div className="pending-card-header">
                    <div className="pending-card-avatar">
                      {business.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="pending-card-body">
                      <div className="pending-meta-row">
                        <span className="badge-type">Nuevo Negocio</span>
                        <span className="time-ago">{business.requestDate}</span>
                      </div>
                      <h4 className="pending-title">{business.name}</h4>
                      <p className="pending-by">
                        <span className="material-symbols-outlined">mail</span>
                        {business.email}
                      </p>
                    </div>
                  </div>
                  <div className="pending-actions">
                    <button
                      className="btn-reject"
                      type="button"
                      disabled={processingId === business.id}
                      onClick={() => handleReject(business.id)}
                    >
                      {processingId === business.id ? "..." : "Rechazar"}
                    </button>
                    <button
                      className="btn-approve"
                      type="button"
                      disabled={processingId === business.id}
                      onClick={() => handleApprove(business.id)}
                    >
                      {processingId === business.id ? "Procesando..." : "Aprobar"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Key Metrics */}
        <div className="metrics-column">
          <div className="metrics-detail-card">
            <h3 className="section-title">Métricas clave</h3>
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
                    <span className="bar-label">Cambiador<span className="bar-value">85%</span></span>
                  </div>
                </div>
                <div className="filter-bar-row">
                  <span className="rank">#2</span>
                  <div className="bar-container">
                    <div className="bar-fill" style={{ width: "62%" }}></div>
                    <span className="bar-label">Interior<span className="bar-value">62%</span></span>
                  </div>
                </div>
                <div className="filter-bar-row">
                  <span className="rank">#3</span>
                  <div className="bar-container">
                    <div className="bar-fill" style={{ width: "45%" }}></div>
                    <span className="bar-label">Gratis<span className="bar-value">45%</span></span>
                  </div>
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
