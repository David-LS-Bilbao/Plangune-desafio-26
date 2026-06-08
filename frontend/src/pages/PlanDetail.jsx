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

/** Clave de localStorage donde se guardan las reseñas añadidas por el usuario, por plan. */
function reviewsStorageKey(planId) {
  return `txikiplan:reviews:${planId}`;
}

/** Lee del localStorage las reseñas guardadas localmente para un plan. */
function loadStoredReviews(planId) {
  try {
    const raw = localStorage.getItem(reviewsStorageKey(planId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Guarda en localStorage las reseñas añadidas por el usuario para un plan. */
function storeReviews(planId, userReviews) {
  try {
    localStorage.setItem(reviewsStorageKey(planId), JSON.stringify(userReviews));
  } catch {
    // localStorage no disponible (modo privado, cuota...): la reseña queda solo en memoria.
  }
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
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReviewText, setNewReviewText] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const seedReview = {
    id: 1,
    author: "Familia Agirre",
    avatar: "FA",
    time: "Hace 2 semanas",
    text: "Excelente plan para el fin de semana. Muy bien acondicionado para carritos.",
    rating: 5,
  };
  const [reviews, setReviews] = useState([seedReview]);

  // Recupera las reseñas guardadas localmente para este plan al cambiar de plan.
  useEffect(() => {
    setReviews([...loadStoredReviews(id), seedReview]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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
  const availableServices = SERVICES.filter((s) => plan[s.key]);

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
          <div className="btn-back-wrapper">
            <button type="button" className="btn-text-danger detail-back-btn" onClick={() => navigate(-1)}>
              <span className="material-symbols-outlined">arrow_back</span>
              Volver atrás
            </button>
          </div>
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

      {/* Servicios familiares (datos reales del backend); solo se listan los disponibles */}
      {availableServices.length > 0 && (
        <section className="detail-services">
          <h3 className="detail-services__title">Servicios familiares</h3>
          <div className="detail-services__list">
            {availableServices.map((s) => (
              <span key={s.key} className="detail-service-chip">
                <span className="material-symbols-outlined">{s.icon}</span>
                {s.label}
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="detail-actions">
        <button
          className="detail-btn detail-btn--primary detail-btn--directions"
          type="button"
          onClick={() => window.open(mapsUrl(plan), "_blank", "noopener")}
        >
          <span className="material-symbols-outlined">directions</span>
          Cómo llegar
        </button>

        <button
          className={`detail-btn detail-btn--outline${favorite ? " detail-btn--active" : ""}`}
          type="button"
          onClick={() => toggleFavorite(plan.id)}
        >
          <span className={`material-symbols-outlined${favorite ? " fill" : ""}`}>favorite</span>
          {favorite ? "Guardado en favoritos" : "Guardar en favoritos"}
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

      <section className="detail-reviews">
        <div className="detail-reviews__header">
          <div>
            <h3 className="detail-reviews__title">Reseñas familiares</h3>
            {plan.rating != null && (
              <div className="detail-reviews__rating">
                <span className="detail-reviews__score">{plan.rating}</span>
                <span className="material-symbols-outlined fill">star</span>
                <span className="material-symbols-outlined fill">star</span>
                <span className="material-symbols-outlined fill">star</span>
                <span className="material-symbols-outlined fill">star</span>
                <span className="material-symbols-outlined">star_half</span>
              </div>
            )}
          </div>
          <button
            className="detail-reviews__add-btn"
            type="button"
            onClick={() => setShowReviewForm((v) => !v)}
          >
            {showReviewForm ? "Cancelar" : "Añadir reseña"}
          </button>
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
                if (!newReviewText.trim()) return;
                const review = {
                  id: Date.now(),
                  author: "Tú",
                  avatar: "TU",
                  time: "Justo ahora",
                  text: newReviewText,
                  rating: newReviewRating,
                };
                setReviews((prev) => {
                  const next = [review, ...prev];
                  storeReviews(id, next.filter((r) => r.id !== seedReview.id));
                  return next;
                });
                setNewReviewText("");
                setNewReviewRating(5);
                setShowReviewForm(false);
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
                  <span key={i} className={`material-symbols-outlined${i < review.rating ? " fill" : ""}`}>
                    star
                  </span>
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
