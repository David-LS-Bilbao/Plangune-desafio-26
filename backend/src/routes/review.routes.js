import { Router } from 'express';
import { body } from 'express-validator';

import { validate } from '../middlewares/validate.js';
import { createReviewHandler } from '../controllers/review.controller.js';

const router = Router();

// Montado bajo /api/reviews desde routes/index.js
router.post(
  '/',
  // Validaciones de contrato: reseña vinculada a actividad y rating acotado.
  [
    body('activityId').notEmpty().withMessage('activityId es obligatorio'),
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('rating debe ser un entero entre 1 y 5'),
    body('comment')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('comment admite como máximo 1000 caracteres'),
  ],
  validate,
  createReviewHandler,
);

export default router;
