import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

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
function RecommendedPlans({ context = {}, title = "" }) {
  const { t } = useTranslation();
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
        <h2 className="rec-section__title">{title || t("rec_card.default_title")}</h2>
        <p className="rec-section__muted">{t("rec_card.error")}</p>
      </section>
    );
  }

  if (!loading && cards.length === 0) {
    return (
      <section className="rec-section">
        <h2 className="rec-section__title">{title || t("rec_card.default_title")}</h2>
        <p className="rec-section__muted">{t("rec_card.empty")}</p>
      </section>
    );
  }

  return (
    <section className="rec-section" aria-label={t("rec_card.section_label")}>
      <h2 className="rec-section__title">{title || t("rec_card.default_title")}</h2>

      {loading ? (
        <div className="planner-state planner-state--inline">
          <div className="planner-spinner" role="status" aria-label={t("rec_card.loading")} />
          <p className="planner-state__text">{t("rec_card.loading")}</p>
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
