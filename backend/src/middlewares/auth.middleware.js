import { verifyToken } from '../utils/jwt.js';

/**
 * Middlewares de autenticación/autorización.
 *
 * `requireAuth`  → exige un JWT válido (cookie httpOnly `token` o cabecera Bearer) y
 *                  rellena `req.user = { id, role }`.
 * `requireRole`  → exige que `req.user.role` esté entre los roles permitidos.
 *
 * Los errores se delegan al errorHandler central con `.status` (401/403, mensajes seguros).
 */

const COOKIE_NAME = 'token';

/** Crea un error HTTP con `.status` para el errorHandler central. */
function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

/**
 * Extrae el token del request. Prioridad:
 *   1) Cabecera `Authorization: Bearer <token>` (cómoda para tests/integraciones).
 *   2) Cookie httpOnly `token` (mecanismo principal del navegador).
 * Se parsea la cookie a mano para no añadir la dependencia `cookie-parser`.
 */
function readToken(req) {
  const header = req.headers?.authorization;
  if (typeof header === 'string' && header.startsWith('Bearer ')) {
    return header.slice(7).trim();
  }

  const rawCookie = req.headers?.cookie;
  if (typeof rawCookie === 'string' && rawCookie.length > 0) {
    const found = rawCookie
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${COOKIE_NAME}=`));
    if (found) {
      return decodeURIComponent(found.slice(COOKIE_NAME.length + 1));
    }
  }

  return null;
}

/** Exige autenticación. Rellena `req.user = { id, role }` o lanza 401. */
export function requireAuth(req, _res, next) {
  const token = readToken(req);
  if (!token) {
    return next(httpError(401, 'No autenticado'));
  }

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, role: payload.role };
    return next();
  } catch {
    // Token inválido, manipulado o expirado.
    return next(httpError(401, 'Sesión no válida'));
  }
}

/**
 * Exige que el usuario autenticado tenga uno de los roles indicados.
 * Debe usarse SIEMPRE después de `requireAuth`.
 * @param {...string} roles
 */
export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(httpError(401, 'No autenticado'));
    }
    if (!roles.includes(req.user.role)) {
      return next(httpError(403, 'No autorizado'));
    }
    return next();
  };
}

export default { requireAuth, requireRole };
