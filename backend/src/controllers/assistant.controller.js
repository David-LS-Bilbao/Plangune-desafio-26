import { asyncHandler } from '../utils/asyncHandler.js';
import { getFamilyPlanFallback } from '../services/assistant.service.js';

/** POST /api/assistant/family-plan — plan familiar (fallback sin IA). */
export const familyPlanHandler = asyncHandler(async (req, res) => {
  const { childrenAges, strollerFriendly, rainSuitable, budget, municipality } = req.body;

  // Normaliza solo los campos que usa el recomendador; el texto del usuario queda fuera del MVP.
  const context = {
    childrenAges: Array.isArray(childrenAges) ? childrenAges : [],
    strollerFriendly,
    rainSuitable,
    budget: typeof budget === 'number' ? budget : undefined,
    municipality,
  };

  res.status(200).json(getFamilyPlanFallback(context));
});
