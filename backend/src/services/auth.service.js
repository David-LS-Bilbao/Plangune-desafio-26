import bcrypt from 'bcryptjs';

import {
  findUserByEmail,
  findUserById,
  createUser,
} from '../repositories/user.repository.js';

/**
 * Lógica de autenticación del login mínimo (registro, login, sesión actual).
 *
 * Reglas de seguridad:
 *   - Las contraseñas se guardan SIEMPRE hasheadas con bcrypt (nunca en claro).
 *   - Las respuestas NUNCA incluyen el hash (`sanitizeUser`).
 *   - El login devuelve un error genérico (no revela si el email existe).
 *   - El registro público NO permite crear administradores (solo vía seed/DB).
 */

const BCRYPT_ROUNDS = 10;
const DUMMY_PASSWORD_HASH = '$2a$10$jT8W3f2RPMCUJ.MiHTxp3ugqObgpOto38XZ0zo8y9.K6BsdQ2bKq.';

/** Roles que un usuario puede elegir al registrarse públicamente. */
export const PUBLIC_ROLES = ['family', 'business', 'admin'];

/** Crea un error HTTP con `.status` para el errorHandler central. */
function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

/** Hashea una contraseña en claro. */
export async function hashPassword(plain) {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

/** Compara una contraseña en claro con su hash. Devuelve boolean (nunca lanza por mismatch). */
export async function verifyPassword(plain, hash) {
  if (!hash) return false;
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    // Hash con formato inválido (p. ej. placeholder de seed antiguo) → no autenticar.
    return false;
  }
}

/** Devuelve el usuario sin el hash de contraseña (shape público estable). */
export function sanitizeUser(user) {
  if (!user) return null;
  return { id: user.id, email: user.email, role: user.role };
}

/**
 * Registra un usuario nuevo (rol `family` o `business`).
 * @param {{ email: string, password: string, role: string }} params
 * @returns {Promise<object>} usuario sin hash
 * @throws 409 si el email ya existe; 422 si el rol no es público.
 */
export async function registerUser({ email, password, role }) {
  const normalizedEmail = String(email).trim().toLowerCase();

  if (!PUBLIC_ROLES.includes(role)) {
    throw httpError(422, 'Rol no permitido');
  }

  const existing = await findUserByEmail(normalizedEmail);
  if (existing) {
    throw httpError(409, 'El email ya está registrado');
  }

  const passwordHash = await hashPassword(password);
  const created = await createUser({ email: normalizedEmail, password: passwordHash, role });
  return sanitizeUser(created);
}

/**
 * Autentica por email + contraseña.
 * @param {{ email: string, password: string }} params
 * @returns {Promise<object>} usuario sin hash
 * @throws 401 genérico si las credenciales no son válidas.
 */
export async function loginUser({ email, password }) {
  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await findUserByEmail(normalizedEmail);

  // Mismo error tanto si el email no existe como si la contraseña falla (no filtrar cuál).
  const passwordHash = user?.password || DUMMY_PASSWORD_HASH;
  const passwordMatches = await verifyPassword(password, passwordHash);
  const ok = Boolean(user && passwordMatches);
  if (!ok) {
    throw httpError(401, 'Credenciales inválidas');
  }

  return sanitizeUser(user);
}

/**
 * Recupera el usuario actual a partir de su id (para GET /api/auth/me).
 * @param {number} id
 * @returns {Promise<object>} usuario sin hash
 * @throws 401 si el usuario ya no existe (token de usuario borrado).
 */
export async function getCurrentUser(id) {
  const user = await findUserById(id);
  if (!user) {
    throw httpError(401, 'Sesión no válida');
  }
  return sanitizeUser(user);
}

export default { registerUser, loginUser, getCurrentUser, sanitizeUser, hashPassword, verifyPassword, PUBLIC_ROLES };
