import { Router } from 'express';

import { getHealth } from '../controllers/health.controller.js';

const router = Router();

// Montado bajo /api/health desde routes/index.js
router.get('/', getHealth);

export default router;
