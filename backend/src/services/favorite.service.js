import { activityExists, getActivityById } from './activity.service.js';

/**
 * Favoritos en memoria para un único usuario mock (sin auth todavía).
 * Operaciones idempotentes. Se reinicia al reiniciar el proceso.
 */
const favoriteIds = new Set();

/**
 * Añade una actividad a favoritos. Idempotente.
 * Lanza error 404 (con `.status`) si la actividad no existe.
 */
export function addFavorite(activityId) {
  if (!activityExists(activityId)) {
    const error = new Error('Actividad no encontrada');
    error.status = 404;
    throw error;
  }

  favoriteIds.add(activityId);
  return { activityId, favorited: true };
}

/** Quita una actividad de favoritos. Idempotente (no falla si no estaba). */
export function removeFavorite(activityId) {
  const removed = favoriteIds.delete(activityId);
  return { activityId, favorited: false, removed };
}

/** Lista las actividades marcadas como favoritas (array de actividades). */
export function listFavorites() {
  return [...favoriteIds].map((id) => getActivityById(id)).filter(Boolean);
}
