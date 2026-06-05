import axios from "axios";

// Fachada única: el frontend consume SOLO Express bajo /api.
// Nunca llama directamente a Data API, Flask, Python, Ollama ni servicios internos.
// Contrato: docs/contracts/frontend-backend-api-contract.md
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

/**
 * GET /api/recommendations
 *
 * @param {object} filters  { edad, municipio, carrito, cambiador, lluvia, budget }
 * @returns {Promise<Array>} array de recomendaciones { event, activity, score, reasons, source }
 */
export async function fetchRecommendations(filters = {}) {
  const params = { limit: 3 };

  if (filters.edad !== "" && filters.edad != null) params.childrenAges = filters.edad;
  if (filters.municipio) params.municipality = filters.municipio;
  if (filters.carrito) params.strollerFriendly = true;
  if (filters.cambiador) params.changingTable = true;
  if (filters.lluvia) params.rainSuitable = true;
  if (filters.budget !== "" && filters.budget != null) params.budget = filters.budget;

  const { data } = await axios.get(`${API_BASE}/recommendations`, { params });
  return Array.isArray(data) ? data : [];
}
