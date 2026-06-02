import { asyncHandler } from '../utils/asyncHandler.js';
import { getRecommendations } from '../services/recommendation.service.js';

/** Convierte "true"/"false" de query string en booleano (o undefined). */
function parseBool(value) {
  if (value === undefined) return undefined;
  return value === 'true' || value === true;
}

/** Construye el contexto del recomendador a partir de la query string. */
function parseContext(query) {
  const { childrenAges, strollerFriendly, rainSuitable, budget, municipality } = query;

  return {
    childrenAges: childrenAges
      ? String(childrenAges)
          .split(',')
          .map((n) => Number(n.trim()))
          .filter((n) => !Number.isNaN(n))
      : [],
    strollerFriendly: parseBool(strollerFriendly),
    rainSuitable: parseBool(rainSuitable),
    budget: budget !== undefined ? Number(budget) : undefined,
    municipality: municipality || undefined,
  };
}

/** GET /api/recommendations — hasta 3 planes con Family Score. */
export const getRecommendationsHandler = asyncHandler(async (req, res) => {
  // La query string llega como texto; el parser deja tipos simples para el service.
  const context = parseContext(req.query);
  res.status(200).json(getRecommendations(context));
});
