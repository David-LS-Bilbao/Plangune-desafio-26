import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePlansStore, useUserStore } from "../store";

function PlanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reportStatus, setReportStatus] = useState("");

  const plan = usePlansStore((state) => state.getPlanById(id));

  const isFavorite = useUserStore((state) => state.isFavorite(parseInt(id)));
  const toggleFavorite = useUserStore((state) => state.toggleFavorite);

  if (!plan) {
    return (
      <main
        className="plan-detail-main"
        style={{ padding: "2rem", textAlign: "center" }}
      >
        <h2>Plan no encontrado</h2>
        <button
          onClick={() => navigate("/planes")}
          className="btn-primary"
          style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}
        >
          Volver
        </button>
      </main>
    );
  }

  return (
    <main className="plan-detail-main">
      {/* Header Section */}
      <div className="detail-header">
        <h1 className="detail-title">{plan.title}</h1>
        <div className="detail-location">
          <span className="material-symbols-outlined text-sm">location_on</span>
          <span>{plan.location}</span>
        </div>
      </div>

      {/* Hero Image */}
      <div className="detail-hero-image">
        <img alt={`Imagen de ${plan.title}`} src={plan.image} />
        <button className="map-toggle-btn">
          <span className="material-symbols-outlined text-lg">map</span>
          Ver Mapa
        </button>
      </div>

      <div style={{ padding: "0 var(--spacing-margin-mobile)" }}>
        <p
          style={{
            marginTop: "1rem",
            color: "var(--on-surface-variant)",
            fontSize: "16px",
            lineHeight: "1.5",
          }}
        >
          {plan.description}
        </p>
      </div>

      {/* Practical Info Bento Grid */}
      <section className="practical-info-grid">
        <div className="info-card">
          <div className="info-icon bg-secondary">
            <span className="material-symbols-outlined">child_care</span>
          </div>
          <div className="info-text">
            <span className="info-label">Edad</span>
            <span className="info-value">{plan.ageRange}</span>
          </div>
        </div>

        <div className="info-card">
          <div className="info-icon bg-surface">
            <span className="material-symbols-outlined">euro_symbol</span>
          </div>
          <div className="info-text">
            <span className="info-label">Precio</span>
            <span className="info-value">{plan.price}</span>
          </div>
        </div>

        <div className="info-card">
          <div className="info-icon bg-primary">
            <span className="material-symbols-outlined">category</span>
          </div>
          <div className="info-text">
            <span className="info-label">Categoría</span>
            <span className="info-value">{plan.category}</span>
          </div>
        </div>

        <div className="info-card">
          <div className="info-icon bg-tertiary">
            <span className="material-symbols-outlined">stroller</span>
          </div>
          <div className="info-text">
            <span className="info-label">Carrito</span>
            <span className="info-value">
              {plan.tags?.includes("Apto Carrito") ? "Sí" : "No"}
            </span>
          </div>
        </div>

        <div className="info-card col-span-2">
          <div className="info-icon bg-primary">
            <span className="material-symbols-outlined">sentiment_calm</span>
          </div>
          <div className="info-text">
            <span className="info-label">Recomendado</span>
            <span className="info-value">
              {plan.isIdeal ? "Ideal para ti" : "Buen plan"}
            </span>
          </div>
        </div>
      </section>

      {/* Main Actions */}
      <section className="main-actions" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          className="btn-primary-large"
          type="button"
          style={{ flex: 1 }}
          onClick={() => {
            useUserStore.getState().addReservation(plan);
            alert("Reserva confirmada. ¡Disfruta del plan!");
          }}
        >
          <span className="material-symbols-outlined">calendar_today</span>
          Reservar
        </button>
        <button
          className="btn-primary-large"
          type="button"
          style={{ flex: 1, backgroundColor: 'var(--secondary)', color: 'var(--on-secondary)' }}
          onClick={() =>
            window.open(
              `https://www.google.com/maps/search/${encodeURIComponent(plan.location)}`,
              "_blank",
            )
          }
        >
          <span className="material-symbols-outlined">directions</span>
          Cómo llegar
        </button>
        <button
          className="btn-outline-large"
          onClick={() => toggleFavorite(parseInt(id))}
          style={{
            flex: 1,
            backgroundColor: isFavorite
              ? "var(--primary-container)"
              : "transparent",
            borderColor: isFavorite
              ? "var(--primary-container)"
              : "var(--outline-variant)",
            color: isFavorite
              ? "var(--on-primary-container)"
              : "var(--on-surface)",
          }}
        >
          <span
            className={`material-symbols-outlined ${isFavorite ? "fill" : "outline"}`}
          >
            favorite
          </span>
          {isFavorite ? "Guardado" : "Favorito"}
        </button>
      </section>

      {/* Report Button */}
      <div className="report-action">
        <button
          className="btn-report"
          type="button"
          onClick={() =>
            setReportStatus("Tu reporte ha sido enviado. Gracias.")
          }
        >
          <span className="material-symbols-outlined text-lg">report</span>
          <span>Reportar incidencia</span>
        </button>
      </div>
      {reportStatus && <p className="status-message">{reportStatus}</p>}

      {/* Reviews Section */}
      <section className="reviews-section">
        <div className="reviews-header">
          <h3 className="reviews-title">Reseñas familiares</h3>
          <div className="overall-rating">
            <span className="rating-score">{plan.rating}</span>
            <span className="material-symbols-outlined fill text-sm">star</span>
            <span className="material-symbols-outlined fill text-sm">star</span>
            <span className="material-symbols-outlined fill text-sm">star</span>
            <span className="material-symbols-outlined fill text-sm">star</span>
            <span className="material-symbols-outlined text-sm">star_half</span>
          </div>
        </div>

        <div className="review-card">
          <div className="review-author">
            <div className="author-avatar">FA</div>
            <div className="author-info">
              <span className="author-name">Familia Agirre</span>
              <span className="review-time">Hace 2 semanas</span>
            </div>
          </div>
          <p className="review-text">
            "Excelente plan para el fin de semana. Muy bien acondicionado para
            carritos."
          </p>
        </div>
      </section>
    </main>
  );
}

export default PlanDetail;
