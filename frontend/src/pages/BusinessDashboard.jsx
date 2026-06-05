import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useBusinessStore } from "../store";

function BusinessDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activityName, setActivityName] = useState("");
  const [category, setCategory] = useState("");
  const [services, setServices] = useState(["Carrito", "Cambiador"]);
  const [newService, setNewService] = useState("");
  const [message, setMessage] = useState("");

  const addOffer = useBusinessStore((state) => state.addOffer);

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
    setServices((prev) => prev.filter((s) => s !== serviceToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addOffer({ title: activityName, category, tags: services, price: "Consultar", location: "Bilbao" });
    setMessage("Tu actividad se ha enviado a revisión.");
    setActivityName("");
    setCategory("");
    setServices(["Carrito", "Cambiador"]);
  };

  return (
    <main className="biz-dashboard-main">

      <div className="biz-dashboard-header">
        <h1 className="biz-dashboard-title">Gestionar actividad</h1>
        <button type="button" className="btn-text-danger" onClick={() => navigate(-1)}>
          Volver atrás
        </button>
      </div>

      <div className="biz-dashboard-grid">

        {/* Columna izquierda: panel de negocio */}
        <section className="biz-panel">
          <h2 className="biz-panel__title">Panel negocio</h2>
          <p className="biz-panel__subtitle">Actividades y promociones.</p>

          <div className="biz-stat-btns">
            <button type="button" className="biz-stat-btn">
              <span className="material-symbols-outlined">event_available</span>
              Activas: <strong>2</strong>
            </button>
            <button type="button" className="biz-stat-btn">
              <span className="material-symbols-outlined">pending_actions</span>
              Pendientes: <strong>1</strong>
            </button>
            <button type="button" className="biz-stat-btn">
              <span className="material-symbols-outlined">star</span>
              Reseñas: <strong>12</strong>
            </button>
          </div>

          {message && <p className="status-message">{message}</p>}
        </section>

        {/* Columna derecha: nueva actividad */}
        <section className="biz-activity-form">
          <h2 className="biz-panel__title">Nueva actividad</h2>

          <form className="create-family-form" onSubmit={handleSubmit}>

            <div className="create-family-form__group">
              <label className="section-label biz-label" htmlFor="nombre">Nombre actividad</label>
              <input
                type="text"
                id="nombre"
                className="biz-input"
                placeholder="Ej: Taller de cuentos"
                value={activityName}
                onChange={(e) => setActivityName(e.target.value)}
                required
              />
            </div>

            <div className="create-family-form__group">
              <label className="section-label biz-label" htmlFor="categoria">Categoría / edad / zona</label>
              <select
                id="categoria"
                className="biz-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="" disabled>Selecciona una opción...</option>
                <option value="Interior · 0-3 años · Bilbao">Interior · 0-3 años · Bilbao</option>
                <option value="Exterior · 3-6 años · Getxo">Exterior · 3-6 años · Getxo</option>
                <option value="Museo · Todas · Barakaldo">Museo · Todas · Barakaldo</option>
              </select>
            </div>

            <div className="create-family-form__group">
              <label className="section-label biz-label" htmlFor="servicios">Servicios</label>
              <div className="biz-service-input">
                <input
                  className="biz-input"
                  type="text"
                  id="servicios"
                  placeholder="Ej: menú infantil..."
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  onKeyDown={handleServiceKeyDown}
                />
                <button
                  type="button"
                  className="biz-service-add"
                  onClick={handleServiceAdd}
                >
                  <span className="material-symbols-outlined">add</span>
                </button>
              </div>
              <div className="search-form__pills" style={{ marginTop: "0.4rem" }}>
                {services.map((service) => (
                  <span key={service} className="biz-service-tag">
                    {service}
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "0.9rem", cursor: "pointer" }}
                      onClick={() => handleServiceRemove(service)}
                    >close</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="create-family-form__actions">
              <button type="submit" className="btn-primary">
                <span className="material-symbols-outlined">send</span>
                Enviar a revisión
              </button>
            </div>

          </form>
        </section>

      </div>
    </main>
  );
}

export default BusinessDashboard;
