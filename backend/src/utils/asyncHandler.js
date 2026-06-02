/**
 * Envuelve un controller async y captura rechazos de Promise,
 * pasándolos al errorHandler central mediante next(err).
 *
 * Uso: router.get('/ruta', asyncHandler(async (req, res) => { ... }))
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export default asyncHandler;
