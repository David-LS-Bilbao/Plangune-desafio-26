import apiClient from "./apiClient";

/**
 * Servicio de recomendaciones. Solo habla con Express:
 *   GET /api/recommendations
 *
 * El contrato usa query params en camelCase (municipality, childrenAges,
 * strollerFriendly, rainSuitable, changingTable, wheelchairAccessible,
 * petsAllowed, budget, limit). Express decide internamente Data API o el
 * recomendador local; el frontend nunca llama a Data/Flask/Ollama directamente.
 */

/**
 * Normaliza el contexto a query params válidos:
 *  - `childrenAges` array -> "2,5" (CSV que espera el backend).
 *  - omite vacíos/undefined/null y arrays vacíos.
 *  - conserva `budget: 0` (gratis) y otros 0 legítimos.
 */
function cleanParams(context = {}) {
  const params = {};
  for (const [key, value] of Object.entries(context)) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) {
      if (value.length === 0) continue;
      params[key] = value.join(",");
    } else {
      params[key] = value;
    }
  }
  return params;
}

/**
 * Pide recomendaciones familiares explicables.
 * @param {object} [context] contexto en camelCase (ver contrato).
 * @returns {Promise<Array>} array de items { event, activity, score, reasons, source }.
 */
export async function fetchRecommendations(context = {}) {
  const { data } = await apiClient.get("/recommendations", {
    params: cleanParams(context),
  });
  return Array.isArray(data) ? data : [];
}

export default { fetchRecommendations };
