import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { fetchRecommendations } from "../../services/recommendationsApi";
import { recommendationsToCards } from "../../mappers/recommendationMapper";
import { useFavorites } from "../../context/FavoritesContext";
import "./RecommendedPlans.css";

/**
 * Bloque de recomendaciones familiares explicables.
 *
 * Consume GET /api/recommendations (vía servicio) usando `context` (filtros del
 * usuario en camelCase). Es autónomo: su loading/error/empty NO afecta al resto de
 * la pantalla. Si /api/recommendations falla, muestra un aviso discreto y nada más,
 * de modo que /buscar (o /planes) sigue funcionando.
 */
function RecommendedPlans({ context = {}, title = "Recomendado para tu familia" }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();

  // Clave estable: re-pide solo cuando cambian los valores del contexto.
  const contextKey = JSON.stringify(context);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    fetchRecommendations(context)
      .then((list) => {
        if (active) setCards(recommendationsToCards(list));
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextKey]);

  // Fallo: no rompe la pantalla; aviso discreto.
  if (error) {
    return (
      <section className="rec-section">
        <h2 className="rec-section__title">{title}</h2>
        <p className="rec-section__muted">
          No hemos podido cargar recomendaciones ahora mismo. Puedes seguir explorando los planes.
        </p>
      </section>
    );
  }

  if (!loading && cards.length === 0) {
    return (
      <section className="rec-section">
        <h2 className="rec-section__title">{title}</h2>
        <p className="rec-section__muted">
          Ajusta los filtros (edad, municipio, servicios) para recibir recomendaciones personalizadas.
        </p>
      </section>
    );
  }

  return (
    <section className="rec-section" aria-label="Recomendaciones familiares">
      <h2 className="rec-section__title">{title}</h2>

      {loading ? (
        <div className="planner-state planner-state--inline">
          <div className="planner-spinner" role="status" aria-label="Cargando recomendaciones" />
          <p className="planner-state__text">Buscando los mejores planes para tu familia...</p>
        </div>
      ) : (
        <div className="rec-list">
          {cards.map((card, index) => {
            const favorite = card.hasDetail && isFavorite(card.id);
            return (
              <article key={card.id ?? `rec-${index}`} className="rec-card">
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
          })}
        </div>
      )}
    </section>
  );
}

export default RecommendedPlans;
