import { Router } from 'express';

import {
  listFavoritesHandler,
  addFavoriteHandler,
  removeFavoriteHandler,
} from '../controllers/favorite.controller.js';

const router = Router();

// Montado bajo /api/favorites desde routes/index.js
router.get('/', listFavoritesHandler);
router.post('/:activityId', addFavoriteHandler);
router.delete('/:activityId', removeFavoriteHandler);

export default router;
