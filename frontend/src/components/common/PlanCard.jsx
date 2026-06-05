import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const chessPattern = ["tertiary", "primary", "accent"];

function PlanCard({ plan, index = 0 }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const colorVariant = chessPattern[index % chessPattern.length];

  return (
    <div
      className={`plan-user-card plan-user-card--${colorVariant}`}
      onClick={() => navigate(`/planes/${plan.id}`)}
    >
      <div className="plan-user-card__image">
        <img src={plan.image} alt={plan.title} />
        {plan.isIdeal && (
          <span className="plan-user-card__ideal-badge">
            <span className="material-symbols-outlined fill">stars</span>
            {t('planCard.ideal', 'Ideal')}
          </span>
        )}
      </div>

      <div className="plan-user-card__body">
        <div className="plan-user-card__header">
          <span className={`plan-user-badge plan-user-badge--${colorVariant}`}>{plan.category}</span>
          <span className="plan-user-card__rating">
            <span className="material-symbols-outlined fill">star</span>
            {plan.rating}
          </span>
        </div>

        <h3 className="plan-user-card__title">{plan.title}</h3>

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
              {expanded ? t('common.readLess', 'Leer menos') : t('common.readMore', 'Leer más')}
            </button>
          )}
        </div>

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
            <span key={tag} className="plan-user-card__tag">{tag}</span>
          ))}
        </div>

        <button className="plan-user-card__btn" type="button">
          {plan.price} · {t('planCard.viewPlan', 'Ver plan')}
        </button>
      </div>
    </div>
  );
}

export default PlanCard;
