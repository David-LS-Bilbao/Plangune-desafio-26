import { asyncHandler } from '../utils/asyncHandler.js';
import { signToken, getExpiresInMs } from '../utils/jwt.js';
import { registerUser, loginUser, googleLoginUser, getCurrentUser } from '../services/auth.service.js';

/**
 * Controladores de autenticación (POST /register, POST /login, GET /me, POST /logout).
 *
 * El token viaja en una cookie httpOnly `token` (no accesible por JS → mitiga XSS).
 * El cuerpo de la respuesta SOLO devuelve `{ user }` (sin token ni hash).
 */

const COOKIE_NAME = 'token';

/** Opciones de la cookie de sesión. `secure` solo en producción (en local va sobre http). */
function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax', // 5173→3000 son same-site (localhost): la cookie viaja en XHR.
    secure: process.env.NODE_ENV === 'production',
    maxAge: getExpiresInMs(),
    path: '/',
  };
}

/** Firma el token del usuario y lo deja en la cookie httpOnly. */
function setAuthCookie(res, user) {
  const token = signToken({ sub: user.id, role: user.role });
  res.cookie(COOKIE_NAME, token, cookieOptions());
}

/** POST /api/auth/register — crea usuario (family/business), inicia sesión y devuelve el user. */
export const registerHandler = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;
  const user = await registerUser({ email, password, role });
  setAuthCookie(res, user);
  res.status(201).json({ user });
});

/** POST /api/auth/login — valida credenciales, inicia sesión y devuelve el user. */
export const loginHandler = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await loginUser({ email, password });
  setAuthCookie(res, user);
  res.status(200).json({ user });
});

/** GET /api/auth/me — devuelve el usuario de la sesión actual (requiere requireAuth). */
export const meHandler = asyncHandler(async (req, res) => {
  const user = await getCurrentUser(req.user.id);
  res.status(200).json({ user });
});

/** POST /api/auth/logout — borra la cookie de sesión. Idempotente. */
export const logoutHandler = asyncHandler(async (_req, res) => {
  res.clearCookie(COOKIE_NAME, { path: '/' });
  res.status(200).json({ ok: true });
});

/** POST /api/auth/google — inicia sesión o registra usando el token de Google. */
export const googleLoginHandler = asyncHandler(async (req, res) => {
  const { credential, role } = req.body;
  const user = await googleLoginUser({ credential, role });
  setAuthCookie(res, user);
  res.status(200).json({ user });
});

export default { registerHandler, loginHandler, googleLoginHandler, meHandler, logoutHandler };
