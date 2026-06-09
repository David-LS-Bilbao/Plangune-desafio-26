import apiClient from "./apiClient";

/**
 * Obtiene todas las reseñas para un evento específico.
 * @param {number|string} eventId 
 * @returns {Promise<Array>} Array de reseñas
 */
export async function fetchReviewsByEvent(eventId) {
  const { data } = await apiClient.get('/reviews', { params: { eventId } });
  return data;
}

/**
 * Crea una nueva reseña para un evento.
 * @param {number|string} activityId ID del evento/actividad
 * @param {number} rating Valoración 1-5
 * @param {string} comment Comentario de la reseña
 * @returns {Promise<Object>} Reseña creada
 */
export async function createReview(activityId, rating, comment) {
  const { data } = await apiClient.post('/reviews', { activityId, rating, comment });
  return data;
}
