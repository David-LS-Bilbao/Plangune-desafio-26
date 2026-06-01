import { validationResult } from 'express-validator';

/**
 * Middleware de validación: recoge el resultado de express-validator y, si hay
 * errores, lanza un error 422 (con `.status`) al errorHandler central.
 * Colocar después de las reglas de validación de cada ruta.
 */
export function validate(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) {
    return next();
  }

  const message = result
    .array()
    .map((e) => e.msg)
    .join('; ');

  const error = new Error(message || 'Datos de entrada inválidos');
  error.status = 422;
  return next(error);
}

export default validate;
