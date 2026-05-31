import { Router } from 'express';

import healthRoutes from './health.routes.js';

const router = Router();

router.use('/health', healthRoutes);

// Aquí se montarán las futuras rutas: /auth, /activities, /business, /admin...

export default router;
