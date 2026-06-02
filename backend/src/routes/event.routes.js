import { Router } from 'express';
import { query } from 'express-validator';

import { validate } from '../middlewares/validate.js';
import { listEvents, getEvent } from '../controllers/event.controller.js';

const router = Router();

// Filtros opcionales por query string (validación mínima).
const eventFilterValidator = [
  query('municipio').optional().isString(),
  query('territorio').optional().isString(),
  query('categoria').optional().isString(),
  query('tipo_evento').optional().isString(),
  query('es_lluvia').optional().isBoolean().withMessage('es_lluvia debe ser booleano'),
  query('es_carrito').optional().isBoolean().withMessage('es_carrito debe ser booleano'),
  query('es_cambiador').optional().isBoolean().withMessage('es_cambiador debe ser booleano'),
  query('edad').optional().isInt({ min: 0 }).withMessage('edad debe ser un entero >= 0'),
  query('fecha_desde').optional().isISO8601().withMessage('fecha_desde debe ser una fecha ISO 8601'),
  query('fecha_hasta').optional().isISO8601().withMessage('fecha_hasta debe ser una fecha ISO 8601'),
];

// Montado bajo /api/events desde routes/index.js
router.get('/', eventFilterValidator, validate, listEvents);
router.get('/:id', getEvent);

export default router;
