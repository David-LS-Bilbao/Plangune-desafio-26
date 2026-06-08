import React from "react";
import { Link } from "react-router-dom";

import { useFavorites } from "../../context/FavoritesContext";
import "./RecommendedPlans.css";

/**
 * Tarjeta de una recomendación familiar (reutilizable).
 *
 * Recibe una `card` ya mapeada por `recommendationToCard` (mapper de recomendaciones).
 * La usan tanto `RecommendedPlans` (bloque de /buscar) como el panel de GUNI.
 *
 * Si `card.hasDetail` es false (recomendación de Data sin id interno), oculta el CTA a
 * detalle y el botón de favorito (no existe `/planes/:id` ni se puede favoritar).
 */
function RecommendationCard({ card }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = card.hasDetail && isFavorite(card.id);

  return (
    <article className="rec-card">
      <div className="rec-card__head">
        <span className="rec-chip">
          <span className="material-symbols-outlined fill">auto_awesome</span>
          {card.scoreLabel}
        </span>
        {card.hasDetail && (
          <button
            type="button"
            className="rec-fav"
            aria-label={favorite ? "Quitar de favoritos" : "Añadir a favoritos"}
            aria-pressed={favorite}
            onClick={() => toggleFavorite(card.id)}
          >
            <span className={`material-symbols-outlined${favorite ? " fill" : ""}`}>
              favorite
            </span>
          </button>
        )}
      </div>

      <h3 className="rec-card__title">{card.title}</h3>

      <p className="rec-card__location">
        <span className="material-symbols-outlined">location_on</span>
        {card.location}
      </p>

      {card.reasons.length > 0 && (
        <ul className="rec-reasons">
          {card.reasons.slice(0, 4).map((reason, i) => (
            <li key={i} className="rec-reason">
              <span className="material-symbols-outlined">check_circle</span>
              {reason}
            </li>
          ))}
        </ul>
      )}

      {card.hasDetail && (
        <Link className="rec-card__cta" to={`/planes/${card.id}`}>
          Ver plan
        </Link>
      )}
    </article>
  );
}

export default RecommendationCard;
