import { asyncHandler } from '../utils/asyncHandler.js';
import { getRecommendations } from '../services/recommendation.service.js';

/** Convierte "true"/"false" de query string en booleano (o undefined). */
function parseBool(value) {
  if (value === undefined) return undefined;
  return value === 'true' || value === true;
}

/** Construye el contexto del recomendador a partir de la query string. */
function parseContext(query) {
  const {
    childrenAges,
    strollerFriendly,
    rainSuitable,
    budget,
    municipality,
    limit,
    changingTable,
    wheelchairAccessible,
    petsAllowed,
    includeKulturklik,
  } = query;

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
    // Adicionales (Data): se mapean en el service. Opcionales; undefined si no vienen.
    changingTable: parseBool(changingTable),
    wheelchairAccessible: parseBool(wheelchairAccessible),
    petsAllowed: parseBool(petsAllowed),
    includeKulturklik: parseBool(includeKulturklik),
    limit: limit !== undefined ? Number(limit) : undefined,
  };
}

/** GET /api/recommendations — recomendaciones de Data o fallback local. */
export const getRecommendationsHandler = asyncHandler(async (req, res) => {
  const context = parseContext(req.query);
  const recommendations = await getRecommendations(context);
  res.status(200).json(recommendations);
});

export default { getRecommendationsHandler };

