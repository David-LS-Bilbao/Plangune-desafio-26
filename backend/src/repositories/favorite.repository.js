import prisma from '../config/prisma.js';

/**
 * Capa de acceso a datos de favoritos. Encapsula las queries Prisma sobre la tabla
 * `user_favorite_events` (modelo `UserFavoriteEvent`, PK compuesta user_id + event_id).
 *
 * No contiene lógica de negocio: el service valida el evento y construye el shape público.
 */

/**
 * Devuelve los eventos favoritos de un usuario (objetos `Event` completos).
 * @param {number} userId
 * @returns {Promise<Array>} array de eventos crudos de Prisma
 */
export async function listFavoriteEventsByUser(userId) {
  const rows = await prisma.userFavoriteEvent.findMany({
    where: { user_id: userId },
    include: { event: true },
    orderBy: { saved_at: 'asc' },
  });
  return rows.map((row) => row.event);
}

/**
 * Marca un evento como favorito para un usuario. Idempotente (upsert sobre la PK
 * compuesta): añadir dos veces no duplica ni falla.
 * @param {number} userId
 * @param {number} eventId
 */
export async function addFavoriteEvent(userId, eventId) {
  return prisma.userFavoriteEvent.upsert({
    where: { user_id_event_id: { user_id: userId, event_id: eventId } },
    update: {}, // ya existe: no-op
    create: { user_id: userId, event_id: eventId },
  });
}

/**
 * Quita un evento de favoritos. Idempotente: `deleteMany` no falla si no existía.
 * @param {number} userId
 * @param {number} eventId
 * @returns {Promise<boolean>} `true` si se eliminó algo, `false` si no estaba
 */
export async function removeFavoriteEvent(userId, eventId) {
  const result = await prisma.userFavoriteEvent.deleteMany({
    where: { user_id: userId, event_id: eventId },
  });
  return result.count > 0;
}
