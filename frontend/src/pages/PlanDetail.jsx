import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { fetchEventById } from "../services/eventsApi";
import { eventToPlan } from "../mappers/eventMapper";
import { useFavorites } from "../context/FavoritesContext";
import getPlanImage from "../utils/getPlanImage";

/** Formatea una fecha ISO a texto legible en español (o null si no hay). */
function formatDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** URL de Google Maps (coordenadas si existen, si no por texto de ubicación). */
function mapsUrl(plan) {
  if (plan.latitud != null && plan.longitud != null) {
    return `https://www.google.com/maps/search/?api=1&query=${plan.latitud},${plan.longitud}`;
  }
  return `https://www.google.com/maps/search/${encodeURIComponent(plan.location)}`;
}

const SERVICES = [
  { key: "es_carrito", icon: "stroller", label: "Carrito" },
  { key: "es_cambiador", icon: "baby_changing_station", label: "Cambiador" },
  { key: "es_interior", icon: "home", label: "Interior" },
  { key: "es_silla_ruedas", icon: "accessible", label: "Silla de ruedas" },
  { key: "es_mascotas", icon: "pets", label: "Mascotas" },
];

function PlanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(false);
  const [reportStatus, setReportStatus] = useState("");

  const load = () => {
    setLoading(true);
    setError(false);
    setNotFound(false);
    fetchEventById(id)
      .then((event) => setPlan(eventToPlan(event)))
      .catch((err) => {
        if (err?.response?.status === 404) setNotFound(true);
        else setError(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <main className="plan-detail-main">
        <div className="planner-state">
          <div className="planner-spinner" role="status" aria-label="Cargando plan" />
          <p className="planner-state__text">Cargando plan...</p>
        </div>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="plan-detail-main">
        <div className="planner-state">
          <span className="material-symbols-outlined planner-state__icon">search_off</span>
          <p className="planner-state__text">Este plan no existe o ya no está disponible.</p>
          <button className="planner-retry" type="button" onClick={() => navigate("/planes")}>
            Ver todos los planes
          </button>
        </div>
      </main>
    );
  }

  if (error || !plan) {
    return (
      <main className="plan-detail-main">
        <div className="planner-state">
          <span className="material-symbols-outlined planner-state__icon">cloud_off</span>
          <p className="planner-state__text">No hemos podido cargar el plan. Inténtalo de nuevo.</p>
          <button className="planner-retry" type="button" onClick={load}>
            Reintentar
          </button>
        </div>
      </main>
    );
  }

  const favorite = isFavorite(plan.id);
  const fecha = formatDate(plan.fecha);

  const infoCards = [
    { icon: "child_care", label: "Edad", value: plan.ageRange, color: "tertiary" },
    { icon: "euro_symbol", label: "Precio", value: plan.price, color: "primary" },
    { icon: "category", label: "Categoría", value: plan.category, color: "accent" },
    fecha
      ? { icon: "calendar_today", label: "Fecha", value: fecha, color: "primary", span2: true }
      : null,
  ].filter(Boolean);

  return (
    <main className="plan-detail-main">
      <div className="detail-header">
        <div className="detail-header__top">
          <h1 className="detail-title">{plan.title}</h1>
          <button
            className="detail-map-btn"
            type="button"
            onClick={() => window.open(mapsUrl(plan), "_blank", "noopener")}
          >
            <span className="material-symbols-outlined">map</span>
            Ver Mapa
          </button>
        </div>
        <div className="detail-location">
          <span className="material-symbols-outlined">location_on</span>
          <span>{plan.location}</span>
        </div>
      </div>

      <section className="detail-info-grid">
        {infoCards.map((card, i) => (
          <div
            key={card.label}
            className={`detail-info-card detail-info-card--${card.color}${card.span2 ? " detail-info-card--span2" : ""} detail-info-card--${i % 2 === 0 ? "odd" : "even"}`}
          >
            <div className="detail-info-icon">
              <span className="material-symbols-outlined">{card.icon}</span>
            </div>
            <div className="detail-info-text">
              <span className="detail-info-label">{card.label}</span>
              <span className="detail-info-value">{card.value}</span>
            </div>
          </div>
        ))}
      </section>

      <div className="detail-hero-image">
        <img
          alt={`Imagen de ${plan.title || "plan familiar"}`}
          src={getPlanImage(plan)}
        />
      </div>

      {/* Servicios familiares (datos reales del backend) */}
      <section className="detail-services">
        <h3 className="detail-services__title">Servicios familiares</h3>
        <div className="detail-services__list">
          {SERVICES.map((s) => (
            <span
              key={s.key}
              className={`detail-service-chip${plan[s.key] ? " detail-service-chip--on" : " detail-service-chip--off"}`}
            >
              <span className="material-symbols-outlined">{s.icon}</span>
              {s.label}: {plan[s.key] ? "Sí" : "No"}
            </span>
          ))}
        </div>
      </section>

      <section className="detail-actions">
        <button
          className={`detail-btn detail-btn--primary${favorite ? " detail-btn--active" : ""}`}
          type="button"
          onClick={() => toggleFavorite(plan.id)}
        >
          <span className={`material-symbols-outlined${favorite ? " fill" : ""}`}>favorite</span>
          {favorite ? "Guardado en favoritos" : "Guardar en favoritos"}
        </button>

        <button
          className="detail-btn detail-btn--secondary"
          type="button"
          onClick={() => window.open(mapsUrl(plan), "_blank", "noopener")}
        >
          <span className="material-symbols-outlined">directions</span>
          Cómo llegar
        </button>
      </section>

      {plan.description && <p className="detail-description">{plan.description}</p>}

      <div className="detail-report">
        <button
          className="detail-report-btn"
          type="button"
          onClick={() => setReportStatus("Tu reporte ha sido enviado. Gracias.")}
        >
          <span className="material-symbols-outlined">report</span>
          Reportar incidencia
        </button>
        {reportStatus && <p className="detail-status">{reportStatus}</p>}
      </div>
    </main>
  );
}

export default PlanDetail;
