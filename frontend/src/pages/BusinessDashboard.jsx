import React from 'react';

function BusinessDashboard() {
  return (
    <main className="business-dashboard-main">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Panel negocio</h1>
        <p className="dashboard-subtitle">Gestiona tus planes y promociones.</p>
      </div>

      {/* Stats Bento Grid */}
      <section className="stats-grid">
        <div className="stat-card col-span-2 flex-row">
          <div className="stat-info">
            <span className="stat-label">Mis actividades activas</span>
            <span className="stat-value text-primary">2</span>
          </div>
          <div className="stat-icon bg-primary-container text-on-primary-container">
            <span className="material-symbols-outlined fill">event_available</span>
          </div>
        </div>

        <div className="stat-card">
          <span className="material-symbols-outlined text-tertiary mb-2">pending_actions</span>
          <div className="stat-info">
            <span className="stat-value block">1</span>
            <span className="stat-label">Pendiente</span>
          </div>
        </div>

        <div className="stat-card">
          <span className="material-symbols-outlined text-secondary mb-2 fill">star</span>
          <div className="stat-info">
            <span className="stat-value block">12</span>
            <span className="stat-label">Reseñas</span>
          </div>
        </div>
      </section>

      {/* Primary Action */}
      <button className="btn-primary-large mt-4 w-full">
        <span className="material-symbols-outlined">add_circle</span>
        Crear actividad
      </button>

      <div className="divider"></div>

      {/* New Activity Form */}
      <section className="new-activity-section">
        <h2 className="section-title">Nueva actividad</h2>
        
        <form className="activity-form">
          {/* Field: Nombre */}
          <div className="form-group">
            <label htmlFor="nombre" className="form-label">Nombre actividad</label>
            <input type="text" id="nombre" className="form-input" placeholder="Ej: Taller de cuentos" />
          </div>

          {/* Field: Categoría / Edad / Zona */}
          <div className="form-group">
            <label htmlFor="categoria" className="form-label">Categoría / edad / zona</label>
            <div className="input-with-icon">
              <select id="categoria" className="form-select" defaultValue="">
                <option value="" disabled>Selecciona una opción...</option>
                <option value="1">Interior · 0-3 años · Bilbao</option>
                <option value="2">Exterior · 3-6 años · Getxo</option>
                <option value="3">Museo · Todas · Barakaldo</option>
              </select>
              <span className="material-symbols-outlined icon pointer-events-none">expand_more</span>
            </div>
          </div>

          {/* Field: Servicios */}
          <div className="form-group">
            <label htmlFor="servicios" className="form-label">Servicios</label>
            <div className="input-with-icon">
              <input type="text" id="servicios" className="form-input pr-10" placeholder="Ej: carrito, cambiador, menú infantil..." />
              <span className="material-symbols-outlined icon">add</span>
            </div>
            
            {/* Chips context */}
            <div className="chips-container mt-2">
              <span className="chip">
                Carrito 
                <button type="button" className="btn-chip-delete">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </span>
              <span className="chip">
                Cambiador 
                <button type="button" className="btn-chip-delete">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </span>
            </div>
          </div>

          <button type="submit" className="btn-outline-secondary w-full mt-4">
            Enviar a revisión
          </button>
        </form>
      </section>
    </main>
  );
}

export default BusinessDashboard;
