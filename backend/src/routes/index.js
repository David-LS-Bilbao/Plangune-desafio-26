import { Router } from 'express';

import activityRoutes from './activity.routes.js';
import assistantRoutes from './assistant.routes.js';
import eventRoutes from './event.routes.js';
import favoriteRoutes from './favorite.routes.js';
import healthRoutes from './health.routes.js';
import incidentRoutes from './incident.routes.js';
import recommendationRoutes from './recommendation.routes.js';
import reviewRoutes from './review.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/activities', activityRoutes);
router.use('/assistant', assistantRoutes);
router.use('/events', eventRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/incidents', incidentRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/reviews', reviewRoutes);

// Futuras rutas: /auth, /business, /admin...

export default router;
