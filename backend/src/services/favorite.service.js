import { findEventById } from '../repositories/event.repository.js';
import { serializeEvent } from '../utils/serializeEvent.js';
import {
  listFavoriteEventsByUser,
  addFavoriteEvent,
  removeFavoriteEvent,
} from '../repositories/favorite.repository.js';

/**
 * Lógica de negocio de favoritos sobre eventos reales (tabla `user_favorite_events`).
 *
 * Con auth: el `userId` proviene SIEMPRE del usuario autenticado (req.user.id), inyectado
 * por el controlador tras `requireAuth`. Cada familia ve y gestiona solo sus favoritos.
 *
 * Contrato de compatibilidad: las rutas usan `:activityId`, pero internamente se trata
 * como `eventId`. La respuesta incluye AMBOS (`eventId` nuevo + `activityId` alias legacy)
 * para no romper el frontend hasta que migre.
 */

/** Crea un error HTTP con `.status` para el errorHandler central. */
function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

/**
 * Convierte el id de ruta (string) a entero positivo.
 * Lanza 404 si no es un id de evento válido (cubre ids no numéricos como "no-existe-999").
 */
function parseEventId(rawId) {
  const eventId = Number(rawId);
  if (!Number.isInteger(eventId) || eventId <= 0) {
    throw httpError(404, 'Evento no encontrado');
  }
  return eventId;
}

// Serialización de eventos: helper común en utils/serializeEvent.js.

/**
 * Añade un evento a favoritos del usuario autenticado. Idempotente.
 * Lanza 404 si el evento no existe.
 * @param {number} userId id del usuario autenticado
 * @param {number|string} rawId id de evento
 * @returns {Promise<{eventId:number, activityId:number, favorited:true}>}
 */
export async function addFavorite(userId, rawId) {
  const eventId = parseEventId(rawId);

  const event = await findEventById(eventId);
  if (!event) {
    throw httpError(404, 'Evento no encontrado');
  }

  await addFavoriteEvent(userId, eventId);
  // `activityId` es alias legacy temporal de `eventId`.
  return { eventId, activityId: eventId, favorited: true };
}

/**
 * Quita un evento de favoritos del usuario autenticado. Idempotente (no falla si no estaba).
 * No comprueba la existencia del evento: borrar un favorito ausente devuelve removed:false.
 * @param {number} userId id del usuario autenticado
 * @param {number|string} rawId id de evento
 * @returns {Promise<{eventId:number, activityId:number, favorited:false, removed:boolean}>}
 */
export async function removeFavorite(userId, rawId) {
  const eventId = parseEventId(rawId);
  const removed = await removeFavoriteEvent(userId, eventId);
  return { eventId, activityId: eventId, favorited: false, removed };
}

/**
 * Lista los eventos favoritos del usuario autenticado (array de eventos reales serializados).
 * @param {number} userId id del usuario autenticado
 * @returns {Promise<Array>}
 */
export async function listFavorites(userId) {
  const events = await listFavoriteEventsByUser(userId);
  return events.map(serializeEvent);
}
