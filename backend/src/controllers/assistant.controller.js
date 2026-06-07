import { asyncHandler } from '../utils/asyncHandler.js';
import { getFamilyPlan } from '../services/assistant.service.js';

/**
 * POST /api/assistant/family-plan
 *
 * Acepta el body nuevo (`message` + `familyProfile`) y mantiene compatibilidad con el
 * body actual (campos sueltos: childrenAges, strollerFriendly, rainSuitable, budget, municipality).
 * Los campos sueltos tienen prioridad; si no vienen, se usan los de `familyProfile`.
 */
export const familyPlanHandler = asyncHandler(async (req, res) => {
  const {
    message,
    familyProfile,
    childrenAges,
    strollerFriendly,
    rainSuitable,
    budget,
    municipality,
  } = req.body;

  const profile = familyProfile && typeof familyProfile === 'object' ? familyProfile : {};

  const context = {
    childrenAges: Array.isArray(childrenAges)
      ? childrenAges
      : Array.isArray(profile.childrenAges)
        ? profile.childrenAges
        : [],
    strollerFriendly: strollerFriendly ?? profile.strollerFriendly,
    rainSuitable: rainSuitable ?? profile.rainSuitable,
    budget:
      typeof budget === 'number'
        ? budget
        : typeof profile.budget === 'number'
          ? profile.budget
          : undefined,
    municipality: municipality ?? profile.municipality,
  };

  res.status(200).json(await getFamilyPlan({ message, context }));
});
