import { Router } from 'express';

import { listActivities, getActivity } from '../controllers/activity.controller.js';

const router = Router();

// Montado bajo /api/activities desde routes/index.js
router.get('/', listActivities);
router.get('/:id', getActivity);

export default router;
