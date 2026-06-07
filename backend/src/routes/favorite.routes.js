import { Router } from 'express';

import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';
import {
  listFavoritesHandler,
  addFavoriteHandler,
  removeFavoriteHandler,
} from '../controllers/favorite.controller.js';

const router = Router();

// Montado bajo /api/favorites desde routes/index.js.
// Datos familiares por usuario → requieren sesión family; `requireAuth` rellena `req.user.id`.
router.use(requireAuth, requireRole('family'));

router.get('/', listFavoritesHandler);
router.post('/:activityId', addFavoriteHandler);
router.delete('/:activityId', removeFavoriteHandler);

export default router;
