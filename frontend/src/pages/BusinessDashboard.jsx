import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useBusinessStore } from "../store";

function BusinessDashboard() {
  const navigate = useNavigate();
  const [activityName, setActivityName] = useState("");
  const [category, setCategory] = useState("");
  const [services, setServices] = useState(["Carrito", "Cambiador"]);
  const [newService, setNewService] = useState("");
  const [message, setMessage] = useState("");
  const formRef = useRef(null);

  const addOffer = useBusinessStore((state) => state.addOffer);

  const handleCreateActivity = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
    setMessage("Listo para añadir una nueva actividad.");
  };

  const handleServiceAdd = () => {
    const trimmed = newService.trim();
    if (trimmed && !services.includes(trimmed)) {
      setServices((prev) => [...prev, trimmed]);
      setNewService("");
    }
  };

  const handleServiceKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleServiceAdd();
    }
  };

  const handleServiceRemove = (serviceToRemove) => {
    setServices((prev) =>
      prev.filter((service) => service !== serviceToRemove),
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addOffer({
      title: activityName,
      category,
      tags: services,
      price: 'Consultar',
      location: 'Bilbao'
    });
    setMessage("Tu actividad se ha enviado a revisión.");
    setActivityName("");
    setCategory("");
    setServices(["Carrito", "Cambiador"]);
  };

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
            <span className="material-symbols-outlined fill">
              event_available
            </span>
          </div>
        </div>

        <div className="stat-card">
          <span className="material-symbols-outlined text-tertiary mb-2">
            pending_actions
          </span>
          <div className="stat-info">
            <span className="stat-value block">1</span>
            <span className="stat-label">Pendiente</span>
          </div>
        </div>

        <div className="stat-card">
          <span className="material-symbols-outlined text-secondary mb-2 fill">
            star
          </span>
          <div className="stat-info">
            <span className="stat-value block">12</span>
            <span className="stat-label">Reseñas</span>
          </div>
        </div>
      </section>

      {/* Primary Action */}
      <button
        className="btn-primary-large mt-4 w-full"
        type="button"
        onClick={handleCreateActivity}
      >
        <span className="material-symbols-outlined">add_circle</span>
        Crear actividad
      </button>

      {message && <p className="status-message">{message}</p>}

      <div className="divider"></div>

      {/* New Activity Form */}
      <section className="new-activity-section" ref={formRef}>
        <h2 className="section-title">Nueva actividad</h2>

        <form className="activity-form" onSubmit={handleSubmit}>
          {/* Field: Nombre */}
          <div className="form-group">
            <label htmlFor="nombre" className="form-label">
              Nombre actividad
            </label>
            <input
              type="text"
              id="nombre"
              className="form-input"
              placeholder="Ej: Taller de cuentos"
              value={activityName}
              onChange={(e) => setActivityName(e.target.value)}
              required
            />
          </div>

          {/* Field: Categoría / Edad / Zona */}
          <div className="form-group">
            <label htmlFor="categoria" className="form-label">
              Categoría / edad / zona
            </label>
            <div className="input-with-icon">
              <select
                id="categoria"
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="" disabled>
                  Selecciona una opción...
                </option>
                <option value="Interior · 0-3 años · Bilbao">
                  Interior · 0-3 años · Bilbao
                </option>
                <option value="Exterior · 3-6 años · Getxo">
                  Exterior · 3-6 años · Getxo
                </option>
                <option value="Museo · Todas · Barakaldo">
                  Museo · Todas · Barakaldo
                </option>
              </select>
              <span className="material-symbols-outlined icon pointer-events-none">
                expand_more
              </span>
            </div>
          </div>

          {/* Field: Servicios */}
          <div className="form-group">
            <label htmlFor="servicios" className="form-label">
              Servicios
            </label>
            <div className="input-with-icon">
              <input
                type="text"
                id="servicios"
                className="form-input pr-10"
                placeholder="Ej: menú infantil, zona de juego..."
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                onKeyDown={handleServiceKeyDown}
              />
              <button
                type="button"
                className="icon"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', padding: 0 }}
                onClick={handleServiceAdd}
                aria-label="Añadir servicio"
              >
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>

            {/* Chips context */}
            <div className="chips-container mt-2">
              {services.map((service) => (
                <span key={service} className="chip">
                  {service}
                  <button
                    type="button"
                    className="btn-chip-delete"
                    onClick={() => handleServiceRemove(service)}
                  >
                    <span className="material-symbols-outlined text-sm">
                      close
                    </span>
                  </button>
                </span>
              ))}
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
