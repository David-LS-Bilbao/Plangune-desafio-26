import jwt from 'jsonwebtoken';

/**
 * Utilidades JWT (firma/verificación) del login mínimo.
 *
 * El secreto y la expiración se leen de `process.env` EN CADA LLAMADA (no al importar)
 * para que los tests puedan fijar `JWT_SECRET`/`JWT_EXPIRES_IN` antes de invocar.
 *
 * El token NO transporta datos sensibles: solo `sub` (id de usuario) y `role`.
 */

const DEFAULT_EXPIRES_IN = '7d';
const JWT_ALGORITHM = 'HS256';
const MIN_SECRET_LENGTH = 32;
const FORBIDDEN_SECRETS = new Set([
  'change_me',
  'change_me_in_local_env',
  'replace_with_32_plus_random_chars',
  'changeme',
  'secret',
  'test-secret',
]);

/** Lee el secreto JWT; lanza si falta (mejor fallar pronto que firmar inseguro). */
function getSecret() {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) {
    const err = new Error('JWT_SECRET no está configurado');
    err.status = 500;
    throw err;
  }
  if (secret.length < MIN_SECRET_LENGTH || FORBIDDEN_SECRETS.has(secret)) {
    const err = new Error('JWT_SECRET debe ser largo, aleatorio y no usar valores por defecto');
    err.status = 500;
    throw err;
  }
  return secret;
}

/** Expiración configurada (formato de `jsonwebtoken`: "7d", "12h"...). */
export function getExpiresIn() {
  return process.env.JWT_EXPIRES_IN || DEFAULT_EXPIRES_IN;
}

/**
 * Firma un token con el payload dado (se espera `{ sub, role }`).
 * @param {object} payload
 * @returns {string} JWT firmado
 */
export function signToken(payload) {
  return jwt.sign(payload, getSecret(), { expiresIn: getExpiresIn(), algorithm: JWT_ALGORITHM });
}

/**
 * Verifica un token. Lanza si es inválido o ha expirado.
 * @param {string} token
 * @returns {object} payload decodificado
 */
export function verifyToken(token) {
  return jwt.verify(token, getSecret(), { algorithms: [JWT_ALGORITHM] });
}

/**
 * Convierte la expiración configurada ("7d", "12h", "30m", "45s" o segundos sueltos)
 * a milisegundos, para usarla como `maxAge` de la cookie. Por defecto 7 días.
 * @returns {number} milisegundos
 */
export function getExpiresInMs() {
  const raw = String(getExpiresIn()).trim();
  const match = raw.match(/^(\d+)\s*([smhd])?$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000;

  const value = Number(match[1]);
  const unit = match[2];
  const unitMs = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  // Sin unidad → `jsonwebtoken` lo interpreta como segundos.
  return value * (unit ? unitMs[unit] : 1000);
}

export default { signToken, verifyToken, getExpiresIn, getExpiresInMs };
