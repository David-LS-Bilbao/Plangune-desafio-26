import prisma from '../config/prisma.js';

/**
 * Crea una reseña persistiendo en la base de datos PostgreSQL.
 * Lanza un error 404 si la actividad no existe.
 */
export async function createReview({ activityId, rating, comment, userId }) {
  const parsedId = parseInt(activityId, 10);
  
  if (isNaN(parsedId)) {
    const error = new Error('Actividad/Evento no encontrado');
    error.status = 404;
    throw error;
  }

  const event = await prisma.event.findUnique({
    where: { id: parsedId }
  });

  if (!event) {
    const error = new Error('Actividad/Evento no encontrado');
    error.status = 404;
    throw error;
  }

  // En la base de datos real el user_id es obligatorio (no nulo) y asocia
  // la reseña al usuario que la está publicando.
  const review = await prisma.review.create({
    data: {
      event_id: parsedId,
      user_id: userId, // Requerido por la BD real (init.sql)
      rating: parseInt(rating, 10),
      comment: comment ?? null,
    }
  });

  return review;
}

/** Devuelve todas las reseñas o por actividad. */
export async function getAllReviews(eventId = null) {
  if (eventId) {
    return prisma.review.findMany({
      where: { event_id: parseInt(eventId, 10) },
      orderBy: { created_at: 'desc' },
      include: { user: { select: { email: true } } }
    });
  }
  
  return prisma.review.findMany({
    orderBy: { created_at: 'desc' },
    include: { user: { select: { email: true } } }
  });
}
