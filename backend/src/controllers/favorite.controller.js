import { asyncHandler } from '../utils/asyncHandler.js';
import {
  addFavorite,
  removeFavorite,
  listFavorites,
} from '../services/favorite.service.js';

/**
 * Controladores de favoritos. Requieren `requireAuth` (rellena `req.user.id`),
 * por lo que cada usuario opera SOLO sobre sus propios favoritos.
 */

/** GET /api/favorites — lista los eventos favoritos del usuario autenticado. */
export const listFavoritesHandler = asyncHandler(async (req, res) => {
  res.status(200).json(await listFavorites(req.user.id));
});

/**
 * POST /api/favorites/:activityId — añade a favoritos.
 * `activityId` es alias legacy de `eventId` (se mantiene la ruta por compatibilidad frontend).
 */
export const addFavoriteHandler = asyncHandler(async (req, res) => {
  res.status(201).json(await addFavorite(req.user.id, req.params.activityId));
});

/**
 * DELETE /api/favorites/:activityId — quita de favoritos.
 * `activityId` es alias legacy de `eventId`.
 */
export const removeFavoriteHandler = asyncHandler(async (req, res) => {
  res.status(200).json(await removeFavorite(req.user.id, req.params.activityId));
});
