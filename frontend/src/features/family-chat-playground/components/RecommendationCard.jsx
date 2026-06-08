import React from "react";

/**
 * Tarjeta de recomendación de plan familiar.
 *
 * Tolerante con el shape que devuelva el backend: usa varios alias
 * habituales (title/name, location/municipality, etc.) y oculta lo que falte.
 *
 * @param {Object} props
 * @param {Object} props.recommendation - Plan recomendado por GUNI.
 */
function RecommendationCard({ recommendation = {} }) {
  const title =
    recommendation.title || recommendation.name || "Plan recomendado";
  const location =
    recommendation.location ||
    recommendation.municipality ||
    recommendation.place ||
    "";
  const description =
    recommendation.description || recommendation.summary || "";
  const price =
    recommendation.price ??
    recommendation.cost ??
    recommendation.budget ??
    null;
  const tags = Array.isArray(recommendation.tags) ? recommendation.tags : [];

  const priceLabel =
    price === 0 || price === "0"
      ? "Gratis"
      : price != null
        ? `${price} €`
        : null;

  return (
    <article className="fcp-rec">
      <header className="fcp-rec__head">
        <h4 className="fcp-rec__title">{title}</h4>
        {priceLabel && <span className="fcp-rec__price">{priceLabel}</span>}
      </header>

      {location && (
        <p className="fcp-rec__location">
          <span aria-hidden="true">📍 </span>
          {location}
        </p>
      )}

      {description && <p className="fcp-rec__desc">{description}</p>}

      {tags.length > 0 && (
        <ul className="fcp-rec__tags">
          {tags.map((tag) => (
            <li key={tag} className="fcp-rec__tag">
              {tag}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

export default RecommendationCard;
