import { getApprovedActivities } from './activity.service.js';

/** ¿La actividad cubre las edades indicadas? */
function coversAges(activity, ages) {
  return ages.every(
    (age) => age >= activity.recommendedAgeMin && age <= activity.recommendedAgeMax,
  );
}

/**
 * Recomendador reglado y explicable (Family Score, MVP).
 * Devuelve como máximo 3 planes ordenados por score, cada uno con sus `reasons`.
 * Solo considera actividades aprobadas. Scoring simple y determinista (sin IA).
 *
 * @param {object} context
 * @param {number[]} [context.childrenAges]
 * @param {boolean} [context.strollerFriendly]
 * @param {boolean} [context.rainSuitable]
 * @param {number}  [context.budget]
 * @param {string}  [context.municipality]
 */
export function getRecommendations(context = {}) {
  const {
    childrenAges = [],
    strollerFriendly,
    rainSuitable,
    budget,
    municipality,
  } = context;

  const scored = getApprovedActivities().map((activity) => {
    let score = 50;
    const reasons = [];

    // Criterios positivos simples: edad, carrito, lluvia, presupuesto y cercanía.
    if (childrenAges.length > 0 && coversAges(activity, childrenAges)) {
      score += 20;
      reasons.push(
        `Apto para la edad de tus peques (${activity.recommendedAgeMin}–${activity.recommendedAgeMax} años)`,
      );
    }

    if (strollerFriendly && activity.strollerFriendly) {
      score += 10;
      reasons.push('Accesible con carrito');
    }

    if (rainSuitable && (activity.rainSuitable || activity.isIndoor)) {
      score += 10;
      reasons.push('Buen plan si llueve (a cubierto)');
    }

    if (typeof budget === 'number' && !Number.isNaN(budget) && activity.estimatedFamilyCost <= budget) {
      score += 10;
      reasons.push(`Dentro de tu presupuesto (${activity.estimatedFamilyCost} €)`);
    }

    if (
      municipality &&
      activity.municipality.toLowerCase().includes(municipality.toLowerCase())
    ) {
      score += 10;
      reasons.push(`Cerca de ${municipality}`);
    }

    // Pequeño empujón por valoración media (hasta +10).
    score += Math.round((activity.averageRating || 0) * 2);

    return { activity, score: Math.min(score, 100), reasons };
  });

  scored.sort((a, b) => b.score - a.score);
  // El contrato público limita la respuesta a tres recomendaciones.
  return scored.slice(0, 3);
}
