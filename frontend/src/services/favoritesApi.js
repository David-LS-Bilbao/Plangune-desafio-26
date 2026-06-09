import apiClient from "./apiClient";

/**
 * Servicio de favoritos. Solo habla con Express:
 *   GET    /api/favorites              (lista de eventos favoritos)
 *   POST   /api/favorites/:eventId      (añadir, idempotente)
 *   DELETE /api/favorites/:eventId      (quitar, idempotente)
 *
 * Requiere sesión family: la cookie httpOnly viaja mediante apiClient.withCredentials.
 * La persistencia es real (PostgreSQL), por lo que los favoritos sobreviven a un F5.
 *
 * Nota de contrato: la ruta pública declara `:activityId` como alias legacy, pero el
 * valor es el id de evento (entero). Aquí lo llamamos `eventId` por claridad.
 */

/**
 * Lista los eventos marcados como favoritos.
 * @returns {Promise<Array>} array de eventos crudos (shape backend)
 */
export async function fetchFavorites() {
  const { data } = await apiClient.get("/favorites");
  return Array.isArray(data) ? data : [];
}

/**
 * Añade un evento a favoritos (idempotente).
 * @param {number|string} eventId id de evento (entero)
 * @returns {Promise<object>} { eventId, activityId, favorited: true }
 */
export async function addFavorite(eventId) {
  const { data } = await apiClient.post(`/favorites/${eventId}`);
  return data;
}

/**
 * Quita un evento de favoritos (idempotente).
 * @param {number|string} eventId id de evento (entero)
 * @returns {Promise<object>} { eventId, activityId, favorited: false, removed }
 */
export async function removeFavorite(eventId) {
  const { data } = await apiClient.delete(`/favorites/${eventId}`);
  return data;
}

export default { fetchFavorites, addFavorite, removeFavorite };
