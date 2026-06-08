import { Router } from 'express';
import { body } from 'express-validator';

import { validate } from '../middlewares/validate.js';
import { familyPlanHandler } from '../controllers/assistant.controller.js';

const router = Router();

// Montado bajo /api/assistant desde routes/index.js
router.post(
  '/family-plan',
  // Validación mínima del payload antes de construir el fallback familiar.
  [
    body('message')
      .optional()
      .isLength({ max: 500 })
      .withMessage('message admite como máximo 500 caracteres'),
    body('familyProfile').optional().isObject().withMessage('familyProfile debe ser un objeto'),
    body('childrenAges').optional().isArray().withMessage('childrenAges debe ser un array'),
    body('budget')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('budget debe ser un número ≥ 0'),
    body('municipality').optional().isString().withMessage('municipality debe ser texto'),
    body('strollerFriendly')
      .optional()
      .isBoolean()
      .withMessage('strollerFriendly debe ser booleano'),
    body('rainSuitable')
      .optional()
      .isBoolean()
      .withMessage('rainSuitable debe ser booleano'),
  ],
  validate,
  familyPlanHandler,
);

export default router;
