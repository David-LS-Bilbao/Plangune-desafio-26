import { Router } from 'express';

import { getReady } from '../controllers/ready.controller.js';

const router = Router();

// Montado bajo /api/ready desde routes/index.js
router.get('/', getReady);

export default router;
