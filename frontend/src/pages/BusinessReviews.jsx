import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const reviews = [
  {
    id: 1,
    name: "Marta L.",
    avatar: "M",
    stars: 5,
    text: "El taller de cerámica fue increíble, los niños se lo pasaron genial. Muy bien organizado.",
    activity: "Taller de Cerámica Familiar",
    date: "2 jun 2026",
  },
  {
    id: 2,
    name: "Javier G.",
    avatar: "J",
    stars: 4.5,
    text: "Buen precio usando la oferta de la app. El local estaba un poco lleno, pero la atención fue rápida.",
    activity: "Ruta Guiada por el Bosque",
    date: "31 may 2026",
  },
  {
    id: 3,
    name: "Ane E.",
    avatar: "A",
    stars: 5,
    text: "Instalaciones muy limpias y adaptadas para carritos. Volveremos seguro el próximo fin de semana.",
    activity: "Taller de Cerámica Familiar",
    date: "29 may 2026",
  },
  {
    id: 4,
    name: "Leire M.",
    avatar: "L",
    stars: 4,
    text: "Actividad muy entretenida para los peques. Los monitores son muy amables y pacientes.",
    activity: "Clase de Surf para Principiantes",
    date: "27 may 2026",
  },
  {
    id: 5,
    name: "Iñaki B.",
    avatar: "I",
    stars: 5,
    text: "Totalmente recomendable. Nos quedamos con ganas de repetir, lo mejor del fin de semana.",
    activity: "Ruta Guiada por el Bosque",
    date: "25 may 2026",
  },
];

function StarRating({ stars }) {
  return (
    <div className="review-card-rating-row">
      <div className="review-card-stars">
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className={`material-symbols-outlined${stars >= i ? " fill" : ""}`}>
            {stars >= i ? "star" : stars >= i - 0.5 ? "star_half" : "star"}
          </span>
        ))}
      </div>
      <span className="review-card-score">{stars} / 5</span>
    </div>
  );
}

function BusinessReviews() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <main className="business-performance-main">
      <div className="biz-dashboard-header">
        <h1 className="page-title">{t("nav.reviews")}</h1>
        <div className="btn-back-wrapper">
          <button type="button" className="btn-text-danger" onClick={() => navigate(-1)}>
            {t("plan_detail.back")}
          </button>
        </div>
      </div>

      <div className="reviews-cards-grid">
        {reviews.map((review) => (
          <article key={review.id} className="review-card">
            <div className="review-card-header">
              <div className="review-card-avatar">{review.avatar}</div>
              <div>
                <p className="review-card-name">{review.name}</p>
                <span className="review-card-date">{review.date}</span>
              </div>
            </div>
            <StarRating stars={review.stars} />
            <span className="review-card-activity-badge">{review.activity}</span>
            <p className="review-card-text">"{review.text}"</p>
          </article>
        ))}
      </div>
    </main>
  );
}

export default BusinessReviews;
