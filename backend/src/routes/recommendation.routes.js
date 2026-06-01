import { Router } from 'express';

import { getRecommendationsHandler } from '../controllers/recommendation.controller.js';

const router = Router();

// Montado bajo /api/recommendations desde routes/index.js
router.get('/', getRecommendationsHandler);

export default router;
