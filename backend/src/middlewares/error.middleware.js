// Códigos 4xx cuyos mensajes son seguros de exponer al cliente
const CLIENT_SAFE_STATUSES = new Set([400, 401, 403, 404, 409, 422]);

/**
 * Responde 404 para cualquier ruta no capturada.
 * Registrar después de todas las rutas de la API en app.js.
 */
export function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Not Found' });
}

/**
 * Manejador central de errores.
 * La firma de 4 parámetros es obligatoria para que Express lo reconozca.
 * Registrar como último middleware en app.js.
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const status = err.status ?? err.statusCode ?? 500;

  let message;
  if (CLIENT_SAFE_STATUSES.has(status)) {
    // Mensajes de errores 4xx son controlados y seguros para el cliente
    message = err.message || 'Error en la solicitud';
  } else {
    // En producción, ocultar detalles internos de errores 5xx
    message =
      process.env.NODE_ENV === 'production'
        ? 'Internal Server Error'
        : err.message || 'Internal Server Error';
  }

  res.status(status).json({ error: message });
}
