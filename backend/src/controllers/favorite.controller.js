import { asyncHandler } from '../utils/asyncHandler.js';
import {
  addFavorite,
  removeFavorite,
  listFavorites,
} from '../services/favorite.service.js';

/** GET /api/favorites — lista las actividades favoritas. */
export const listFavoritesHandler = asyncHandler(async (req, res) => {
  res.status(200).json(listFavorites());
});

/** POST /api/favorites/:activityId — añade a favoritos. */
export const addFavoriteHandler = asyncHandler(async (req, res) => {
  res.status(201).json(addFavorite(req.params.activityId));
});

/** DELETE /api/favorites/:activityId — quita de favoritos. */
export const removeFavoriteHandler = asyncHandler(async (req, res) => {
  res.status(200).json(removeFavorite(req.params.activityId));
});
