import { Router } from 'express';

import healthRoutes from './health.routes.js';
import eventRoutes from './event.routes.js';
import activityRoutes from './activity.routes.js';
import recommendationRoutes from './recommendation.routes.js';
import reviewRoutes from './review.routes.js';
import incidentRoutes from './incident.routes.js';
import favoriteRoutes from './favorite.routes.js';
import assistantRoutes from './assistant.routes.js';

const router = Router();

router.use('/health', healthRoutes);

// Entidad central (datos reales de init.sql, runtime mock)
router.use('/events', eventRoutes);

// API mock previa (se mantiene; se migrará/retirará en pasos posteriores)
router.use('/activities', activityRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/reviews', reviewRoutes);
router.use('/incidents', incidentRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/assistant', assistantRoutes);

// Futuras rutas: /auth, /business, /admin...

export default router;
