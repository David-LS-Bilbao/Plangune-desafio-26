import React, { useEffect, useState } from "react";

import { fetchRecommendations } from "../../services/recommendationsApi";
import { recommendationsToCards } from "../../mappers/recommendationMapper";
import RecommendationCard from "./RecommendationCard";
import "./RecommendedPlans.css";

/**
 * Bloque de recomendaciones familiares explicables.
 *
 * Consume GET /api/recommendations (vía servicio) usando `context` (filtros del
 * usuario en camelCase). Es autónomo: su loading/error/empty NO afecta al resto de
 * la pantalla. Si /api/recommendations falla, muestra un aviso discreto y nada más,
 * de modo que /buscar (o /planes) sigue funcionando.
 *
 * Cada tarjeta se delega en RecommendationCard (reutilizada también por el panel de GUNI).
 */
function RecommendedPlans({ context = {}, title = "Recomendado para tu familia" }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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
          {cards.map((card, index) => (
            <RecommendationCard key={card.id ?? `rec-${index}`} card={card} />
          ))}
        </div>
      )}
    </section>
  );
}

export default RecommendedPlans;
