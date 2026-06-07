import { Router } from 'express';
import { body } from 'express-validator';

import { validate } from '../middlewares/validate.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { authRateLimit } from '../middlewares/authRateLimit.middleware.js';
import { PUBLIC_ROLES } from '../services/auth.service.js';
import {
  registerHandler,
  loginHandler,
  meHandler,
  logoutHandler,
} from '../controllers/auth.controller.js';

const router = Router();

// Validación básica de entrada (email/password/role). Los mensajes son seguros de exponer.
const registerValidator = [
  body('email').isEmail().withMessage('Email no válido').normalizeEmail(),
  body('password')
    .isString()
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .isLength({ max: 72 })
    .withMessage('La contraseña no debe superar 72 caracteres'),
  body('role')
    .isIn(PUBLIC_ROLES)
    .withMessage('El rol debe ser family o business'),
];

const loginValidator = [
  body('email').isEmail().withMessage('Email no válido').normalizeEmail(),
  body('password')
    .isString()
    .notEmpty()
    .withMessage('La contraseña es obligatoria')
    .isLength({ max: 72 })
    .withMessage('La contraseña no debe superar 72 caracteres'),
];

// Montado bajo /api/auth desde routes/index.js
router.post('/register', authRateLimit, registerValidator, validate, registerHandler);
router.post('/login', authRateLimit, loginValidator, validate, loginHandler);
router.get('/me', requireAuth, meHandler);
router.post('/logout', logoutHandler);

export default router;
