// Códigos 4xx cuyos mensajes son seguros de exponer al cliente
const CLIENT_SAFE_STATUSES = new Set([400, 401, 403, 404, 409, 422]);

// Nombres de clases de error de Prisma que indican que la base de datos no está
// disponible (caída, credenciales inválidas, init/conexión). Se tratan como 503.
const PRISMA_DB_UNAVAILABLE_NAMES = new Set([
  'PrismaClientInitializationError',
  'PrismaClientRustPanicError',
]);

// Códigos de error de Prisma (KnownRequestError) de conexión/autenticación/disponibilidad.
// Ref.: https://www.prisma.io/docs/orm/reference/error-reference (P1xxx = capa de conexión)
const PRISMA_DB_UNAVAILABLE_CODES = new Set([
  'P1000', // authentication failed
  'P1001', // can't reach database server
  'P1002', // database server reached but timed out
  'P1008', // operations timed out
  'P1010', // user was denied access
  'P1017', // server has closed the connection
]);

/** ¿Es un error originado por el cliente Prisma? (nombre `PrismaClient*` o `clientVersion`). */
function isPrismaError(err) {
  if (!err) return false;
  return (
    (typeof err.name === 'string' && err.name.startsWith('PrismaClient')) ||
    typeof err.clientVersion === 'string'
  );
}

/** ¿El error indica que la base de datos no está disponible (conexión/auth/init)? */
function isDbUnavailableError(err) {
  if (!err) return false;
  if (PRISMA_DB_UNAVAILABLE_NAMES.has(err.name)) return true;
  // Algunos errores de inicialización exponen el código en `errorCode`.
  const code = err.code ?? err.errorCode;
  return typeof code === 'string' && PRISMA_DB_UNAVAILABLE_CODES.has(code);
}

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
  // 1) Base de datos no disponible (Prisma init/conexión/auth) → 503 genérico.
  //    Nunca se filtra el mensaje interno (tampoco en desarrollo).
  if (isDbUnavailableError(err)) {
    console.error("DB Unavailable Error:", err);
    res.status(503).json({ error: 'Service temporarily unavailable' });
    return;
  }

  const status = err.status ?? err.statusCode ?? 500;

  // 2) Errores 4xx controlados: mensaje seguro tal cual.
  if (CLIENT_SAFE_STATUSES.has(status)) {
    res.status(status).json({ error: err.message || 'Error en la solicitud' });
    return;
  }

  // 3) Resto de 5xx. Cualquier error de Prisma se enmascara SIEMPRE (dev y prod)
  //    para no filtrar detalles internos (tablas, columnas, credenciales...).
  //    Errores no-Prisma conservan el mensaje en desarrollo para depuración.
  const mustMask = isPrismaError(err) || process.env.NODE_ENV === 'production';
  const message = mustMask ? 'Internal Server Error' : err.message || 'Internal Server Error';

  console.error("Unhandled Error:", err);
  res.status(status).json({ error: message });
}
