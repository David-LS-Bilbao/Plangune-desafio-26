import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePlansStore, useUserStore, useAuthStore } from "../store";

function PlanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
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
    },
  ]);

  const plan = usePlansStore((state) => state.getPlanById(id));
  const user = useAuthStore((state) => state.user);
  const isFavorite = useUserStore((state) => state.isFavorite(parseInt(id)));
  const toggleFavorite = useUserStore((state) => state.toggleFavorite);

  if (!plan) {
    return (
      <main className="plan-detail-main">
        <h2>Plan no encontrado</h2>
        <button className="detail-btn detail-btn--primary" onClick={() => navigate("/planes")}>
          Volver
        </button>
      </main>
    );
  }

  const infoCards = [
    { icon: "child_care",  label: "Edad",       value: plan.ageRange,                              color: "tertiary" },
    { icon: "euro_symbol", label: "Precio",      value: plan.price,                                 color: "primary"  },
    { icon: "category",    label: "Categoría",   value: plan.category,                              color: "accent"   },
    { icon: "stroller",    label: "Carrito",      value: plan.tags?.includes("Apto Carrito") ? "Sí" : "No", color: "tertiary" },
    { icon: "sentiment_calm", label: "Recomendado", value: plan.isIdeal ? "Ideal para ti" : "Buen plan", color: "primary", span2: true },
  ];

  return (
    <main className="plan-detail-main">

      <div className="detail-header">
        <div className="detail-header__top">
          <h1 className="detail-title">{plan.title}</h1>
          <button
            className={`detail-btn detail-btn--outline${isFavorite ? " detail-btn--active" : ""}`}
            type="button"
            onClick={() => user ? toggleFavorite(parseInt(id)) : navigate("/login")}
          >
            <span className={`material-symbols-outlined${isFavorite ? " fill" : ""}`}>favorite</span>
            {isFavorite ? "Guardado" : "Favorito"}
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
        <img alt={`Imagen de ${plan.title}`} src={plan.image} />
      </div>

      <section className="detail-actions">
        <button
          className="detail-btn detail-btn--secondary"
          type="button"
          onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent(plan.location)}`, "_blank")}
        >
          <span className="material-symbols-outlined">directions</span>
          Cómo llegar
        </button>

        <button
          className={`detail-btn detail-btn--primary${reserved ? " detail-btn--reserved" : ""}`}
          type="button"
          disabled={reserved}
          onClick={() => { useUserStore.getState().addReservation(plan); setReserved(true); }}
        >
          <span className="material-symbols-outlined">
            {reserved ? "check_circle" : "calendar_today"}
          </span>
          {reserved ? "¡Reservado!" : "Reservar"}
        </button>

      </section>

      <p className="detail-description">{plan.description}</p>

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

      <section className="detail-reviews">
        <div className="detail-reviews__header">
          <div>
            <h3 className="detail-reviews__title">Reseñas familiares</h3>
            <div className="detail-reviews__rating">
              <span className="detail-reviews__score">{plan.rating}</span>
              {[...Array(4)].map((_, i) => (
                <span key={i} className="material-symbols-outlined fill">star</span>
              ))}
              <span className="material-symbols-outlined">star_half</span>
            </div>
          </div>
          <div className="btn-back-wrapper">
            <button
              className="btn-text-danger"
              type="button"
              onClick={() => setShowReviewForm(!showReviewForm)}
            >
              {showReviewForm ? "Cancelar" : "Añadir reseña"}
            </button>
          </div>
        </div>

        {showReviewForm && (
          <div className="detail-review-form">
            <h4 className="detail-review-form__title">Tu valoración</h4>
            <div className="detail-review-form__stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`material-symbols-outlined${newReviewRating >= star ? " fill" : ""}`}
                  onClick={() => setNewReviewRating(star)}
                >
                  star
                </span>
              ))}
            </div>
            <textarea
              className="detail-review-form__textarea"
              value={newReviewText}
              onChange={(e) => setNewReviewText(e.target.value)}
              placeholder="Cuéntanos tu experiencia..."
            />
            <button
              className="detail-btn detail-btn--primary"
              type="button"
              onClick={() => {
                if (newReviewText.trim()) {
                  setReviews([{ id: Date.now(), author: "Tú", avatar: "TU", time: "Justo ahora", text: newReviewText, rating: newReviewRating }, ...reviews]);
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

        {reviews.map((review) => (
          <div className="detail-review-card" key={review.id}>
            <div className="detail-review-card__header">
              <div className="detail-review-card__author">
                <div className="detail-review-card__avatar">{review.avatar}</div>
                <div>
                  <span className="detail-review-card__name">{review.author}</span>
                  <span className="detail-review-card__time">{review.time}</span>
                </div>
              </div>
              <div className="detail-review-card__stars">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`material-symbols-outlined${i < review.rating ? " fill" : ""}`}>star</span>
                ))}
              </div>
            </div>
            <p className="detail-review-card__text">"{review.text}"</p>
          </div>
        ))}
      </section>

    </main>
  );
}

export default PlanDetail;
