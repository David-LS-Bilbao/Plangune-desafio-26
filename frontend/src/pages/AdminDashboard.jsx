import React from 'react';

function AdminDashboard() {
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
          <p className="metric-number">124</p>
        </div>

        <div className="admin-metric-card">
          <div className="metric-icon bg-primary-light">
            <span className="material-symbols-outlined">storefront</span>
          </div>
          <p className="metric-label">Negocios</p>
          <p className="metric-number">18</p>
        </div>

        <div className="admin-metric-card">
          <div className="metric-icon bg-tertiary-light">
            <span className="material-symbols-outlined">explore</span>
          </div>
          <p className="metric-label">Planes</p>
          <p className="metric-number">86</p>
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
            <h3 className="section-title">Pendiente revisión</h3>
            <span className="badge-error">1 Nuevo</span>
          </div>

          <div className="pending-list">
            {/* Pending Item */}
            <div className="pending-card">
              <div className="pending-card-body">
                <div className="pending-meta-row">
                  <span className="badge-type">Nuevo Plan</span>
                  <span className="time-ago">hace 2 horas</span>
                </div>
                <h4 className="pending-title">Taller de cuentos</h4>
                <p className="pending-by">Enviado por: Biblioteca Central Bilbao</p>
                <div className="pending-tags">
                  <span className="pending-tag">
                    <span className="material-symbols-outlined">child_care</span> 3-6 años
                  </span>
                  <span className="pending-tag">
                    <span className="material-symbols-outlined">location_on</span> Interior
                  </span>
                </div>
              </div>
              <div className="pending-actions">
                <button className="btn-reject">Rechazar</button>
                <button className="btn-approve">Aprobar</button>
              </div>
            </div>
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
                    <div className="bar-fill" style={{ width: '85%' }}></div>
                    <span className="bar-label">Cambiador</span>
                  </div>
                  <span className="bar-pct">85%</span>
                </div>
                <div className="filter-bar-row">
                  <span className="rank">#2</span>
                  <div className="bar-container">
                    <div className="bar-fill" style={{ width: '62%' }}></div>
                    <span className="bar-label">Interior</span>
                  </div>
                  <span className="bar-pct">62%</span>
                </div>
                <div className="filter-bar-row">
                  <span className="rank">#3</span>
                  <div className="bar-container">
                    <div className="bar-fill" style={{ width: '45%' }}></div>
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
    </main>
  );
}

export default AdminDashboard;
