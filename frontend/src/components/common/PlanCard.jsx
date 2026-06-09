import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import getPlanImage from '../../utils/getPlanImage';
import { useFavorites } from '../../context/FavoritesContext';

const chessPattern = ["tertiary", "primary", "accent"];

function PlanCard({ plan, index = 0 }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const colorVariant = chessPattern[index % chessPattern.length];
  const favorite = isFavorite(plan.id);

  return (
    <div
      className={`plan-user-card plan-user-card--${colorVariant}`}
      onClick={() => navigate(`/planes/${plan.id}`)}
    >
      <div className="plan-user-card__image">
        <img
          src={getPlanImage(plan)}
          alt={`Imagen de ${plan.title || "plan familiar"}`}
          loading="lazy"
        />
        {plan.isIdeal && (
          <span className="plan-user-card__ideal-badge">
            <span className="material-symbols-outlined fill">stars</span>
            {t("plan_card.ideal")}
          </span>
        )}
        <button
          type="button"
          className="plan-fav-btn"
          aria-label={favorite ? t("plan_card.remove_favorite") : t("plan_card.add_favorite")}
          aria-pressed={favorite}
          onClick={(e) => { e.stopPropagation(); toggleFavorite(plan.id); }}
        >
          <span className={`material-symbols-outlined${favorite ? " fill" : ""}`}>
            favorite
          </span>
        </button>
      </div>

      <div className="plan-user-card__body">
        <div className="plan-user-card__header">
          <span className={`plan-user-badge plan-user-badge--${colorVariant}`}>{plan.category}</span>
        </div>

        <h3 className="plan-user-card__title">{plan.title}</h3>

        {plan.rating != null && (
          <span className="plan-user-card__rating">
            <span className="material-symbols-outlined fill">star</span>
            {plan.rating}
          </span>
        )}

        <div className="plan-user-card__meta">
          <span className="plan-user-card__location">
            <span className="material-symbols-outlined">location_on</span>
            {plan.location}
          </span>
          <span className="plan-user-card__age">
            <span className="material-symbols-outlined">child_care</span>
            {plan.ageRange}
          </span>
        </div>

        <div className="plan-user-card__tags">
          {plan.tags?.slice(0, 3).map((tag) => (
            <span key={tag} className="plan-user-card__tag">{t(`plan_card.tags.${tag}`, tag)}</span>
          ))}
        </div>

        <div className="plan-user-card__subtitle">
          <p className={`plan-user-card__subtitle-text${expanded ? " expanded" : ""}`}>
            {plan.description}
          </p>
          {plan.description && plan.description.length > 120 && (
            <button
              className="plan-user-card__read-more"
              type="button"
              onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
            >
              {expanded ? t("plan_card.read_less") : t("plan_card.read_more")}
            </button>
          )}
        </div>

        <button className="plan-user-card__btn" type="button">
          {plan.price?.toLowerCase() === "gratis" ? t("plan_card.free") : plan.price} · {t("plan_card.view_plan")}
        </button>
      </div>
    </div>
  );
}

export default PlanCard;
