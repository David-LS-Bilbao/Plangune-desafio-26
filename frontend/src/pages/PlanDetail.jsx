import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUserStore } from "../store";
import { fetchEventById, eventToPlan } from "../services/events";

function PlanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | done | error
  const [reportStatus, setReportStatus] = useState("");
  const [reserved, setReserved] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReviewText, setNewReviewText] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [reviews, setReviews] = useState([
    {
      id: 1,
      author: "Familia Agirre",
      avatar: "FA",
      time: "Hace 2 semanas",
      text: "Excelente plan para el fin de semana. Muy bien acondicionado para carritos.",
      rating: 5,
    }
  ]);

  const isFavorite = useUserStore((state) => state.isFavorite(parseInt(id)));
  const toggleFavorite = useUserStore((state) => state.toggleFavorite);

  useEffect(() => {
    let active = true;
    setStatus("loading");
    fetchEventById(id)
      .then((event) => {
        if (!active) return;
        setPlan(eventToPlan(event));
        setStatus("done");
      })
      .catch(() => active && setStatus("error"));
    return () => {
      active = false;
    };
  }, [id]);

  if (status === "loading") {
    return (
      <main className="plan-detail-main" style={{ padding: "2rem", textAlign: "center" }}>
        <p style={{ color: "var(--on-surface-variant)" }}>Cargando plan…</p>
      </main>
    );
  }

  if (status === "error" || !plan) {
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
          style={{ flex: 1, opacity: reserved ? 0.75 : 1 }}
          disabled={reserved}
          onClick={() => {
            useUserStore.getState().addReservation(plan);
            setReserved(true);
          }}
        >
          <span className="material-symbols-outlined">
            {reserved ? "check_circle" : "calendar_today"}
          </span>
          {reserved ? "¡Reservado!" : "Reservar"}
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
        <div className="reviews-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
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
          <button 
            className="btn-primary" 
            style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
            onClick={() => setShowReviewForm(!showReviewForm)}
          >
            {showReviewForm ? "Cancelar" : "Añadir reseña"}
          </button>
        </div>

        {showReviewForm && (
          <div className="review-form" style={{ marginBottom: "1.5rem", padding: "1rem", backgroundColor: "var(--surface-container-lowest)", borderRadius: "12px", border: "1px solid var(--outline-variant)" }}>
            <h4 style={{ marginBottom: "0.5rem" }}>Tu valoración</h4>
            <div style={{ display: "flex", gap: "4px", marginBottom: "1rem" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span 
                  key={star} 
                  className={`material-symbols-outlined ${newReviewRating >= star ? "fill" : ""}`}
                  style={{ cursor: "pointer", color: "var(--md-sys-color-primary)" }}
                  onClick={() => setNewReviewRating(star)}
                >
                  star
                </span>
              ))}
            </div>
            <textarea 
              value={newReviewText}
              onChange={(e) => setNewReviewText(e.target.value)}
              placeholder="Cuéntanos tu experiencia..."
              style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--outline)", marginBottom: "1rem", minHeight: "80px", backgroundColor: "transparent", color: "var(--on-surface)", fontFamily: "inherit" }}
            />
            <button 
              className="btn-primary-full" 
              onClick={() => {
                if (newReviewText.trim()) {
                  setReviews([{
                    id: Date.now(),
                    author: "Tú",
                    avatar: "TU",
                    time: "Justo ahora",
                    text: newReviewText,
                    rating: newReviewRating
                  }, ...reviews]);
                  setNewReviewText("");
                  setNewReviewRating(5);
                  setShowReviewForm(false);
                }
              }}
            >
              Publicar reseña
            </button>
          </div>
        )}

        {reviews.map(review => (
          <div className="review-card" key={review.id} style={{ marginBottom: "1rem" }}>
            <div className="review-author" style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <div className="author-avatar">{review.avatar}</div>
                <div className="author-info">
                  <span className="author-name">{review.author}</span>
                  <span className="review-time">{review.time}</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: "2px" }}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`material-symbols-outlined text-sm ${i < review.rating ? "fill" : ""}`} style={{ color: "var(--primary)" }}>
                    star
                  </span>
                ))}
              </div>
            </div>
            <p className="review-text">"{review.text}"</p>
          </div>
        ))}
      </section>
    </main>
  );
}

export default PlanDetail;
