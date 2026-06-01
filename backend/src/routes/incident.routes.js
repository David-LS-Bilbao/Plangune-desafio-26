import { Router } from 'express';
import { body } from 'express-validator';

import { validate } from '../middlewares/validate.js';
import { createIncidentHandler } from '../controllers/incident.controller.js';

const router = Router();

// Montado bajo /api/incidents desde routes/index.js
router.post(
  '/',
  [
    body('activityId').notEmpty().withMessage('activityId es obligatorio'),
    body('type').notEmpty().withMessage('type es obligatorio'),
    body('description')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('description admite como máximo 1000 caracteres'),
  ],
  validate,
  createIncidentHandler,
);

export default router;
