import axios from "axios";

/**
 * Service del playground de chat familiar.
 *
 * Solo habla con el endpoint del asistente GUNI:
 *   POST /api/assistant/family-plan
 *
 * Nunca accede a Data ni a ninguna otra fuente directamente.
 */

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

/**
 * Construye el payload del asistente a partir del mensaje del usuario
 * y del perfil familiar recogido en el drawer de preferencias.
 *
 * Mapeos relevantes (ver enunciado de la feature):
 *  - "Cubierto o interior"   => rainSuitable
 *  - "Carrito"               => strollerFriendly
 *  - "Gratis o bajo coste"   => budget bajo (0)
 */
export function buildFamilyPlanPayload(message, familyProfile = {}) {
  const {
    childrenAges = [],
    municipality = "",
    strollerFriendly = false,
    rainSuitable = false,
    budget = null,
  } = familyProfile;

  return {
    message,
    familyProfile: {
      childrenAges,
      municipality,
      strollerFriendly,
      rainSuitable,
      budget,
    },
  };
}

/**
 * Envía un mensaje al asistente GUNI y devuelve la respuesta cruda del backend.
 *
 * @param {Object} params
 * @param {string} params.message - Texto del usuario.
 * @param {Object} params.familyProfile - Preferencias familiares.
 * @returns {Promise<Object>} Respuesta del backend (message / assistantMessageMarkdown / mode / recommendations...).
 */
export async function sendFamilyPlanMessage({ message, familyProfile }) {
  const payload = buildFamilyPlanPayload(message, familyProfile);

  const { data } = await axios.post(
    `${API_BASE}/assistant/family-plan`,
    payload,
  );

  return data;
}
