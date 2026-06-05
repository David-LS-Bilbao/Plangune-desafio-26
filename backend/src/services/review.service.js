import { randomUUID } from 'node:crypto';

import { activityExists } from './activity.service.js';

/** Almacén en memoria de reseñas (MVP). Se reinicia al reiniciar el proceso. */
const reviews = [];

/**
 * Crea una reseña en estado `pending`.
 * Lanza un error 404 (con `.status`) si la actividad no existe, para que lo
 * capture el errorHandler central.
 */
export async function createReview({ activityId, rating, comment }) {
  if (!(await activityExists(activityId))) {
    const error = new Error('Actividad no encontrada');
    error.status = 404;
    throw error;
  }

  const review = {
    id: randomUUID(),
    activityId,
    rating,
    comment: comment ?? null,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  reviews.push(review);
  return review;
}

/** Devuelve todas las reseñas (uso interno / futuro panel de moderación). */
export function getAllReviews() {
  return reviews;
}
