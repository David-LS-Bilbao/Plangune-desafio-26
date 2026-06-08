/**
 * Validación de variables de entorno al arrancar.
 *
 * En `production` exige una configuración mínima SEGURA antes de levantar el servidor:
 *   - DATABASE_URL
 *   - JWT_SECRET (presente y fuerte: >= 32 chars, sin placeholders)
 *   - CLIENT_URL
 * Si falta o es insegura, se lanza un error CLARO y el proceso no debe arrancar.
 *
 * Seguridad: el mensaje de error NUNCA incluye valores reales (solo nombres de variables).
 * En development/test no se bloquea el arranque (defaults cómodos para trabajar/local).
 */

const MIN_JWT_SECRET_LENGTH = 32;

// Placeholders conocidos que NO deben usarse como secreto real (alineado con utils/jwt.js).
const PLACEHOLDER_JWT_SECRETS = new Set([
  'change_me',
  'change_me_use_at_least_32_chars',
  'change_me_in_local_env',
  'replace_with_32_plus_random_chars',
  'changeme',
  'secret',
  'test-secret',
]);

// Variables obligatorias en producción.
const REQUIRED_IN_PRODUCTION = ['DATABASE_URL', 'JWT_SECRET', 'CLIENT_URL'];

/**
 * Valida el entorno. En producción lanza si la configuración es insegura.
 *
 * @param {NodeJS.ProcessEnv} [env=process.env]
 * @returns {{ nodeEnv: string, isProduction: boolean }} resumen seguro (sin secretos)
 * @throws {Error} con mensaje claro (sin valores) si la config de producción es insegura
 */
export function validateEnv(env = process.env) {
  const nodeEnv = env.NODE_ENV || 'development';
  const isProduction = nodeEnv === 'production';

  // Fuera de producción no bloqueamos el arranque.
  if (!isProduction) {
    return { nodeEnv, isProduction };
  }

  const errors = [];

  // 1) Obligatorias presentes (no vacías).
  const missing = REQUIRED_IN_PRODUCTION.filter((key) => !String(env[key] ?? '').trim());
  if (missing.length > 0) {
    errors.push(`Missing required production environment variables: ${missing.join(', ')}`);
  }

  // 2) JWT_SECRET fuerte (solo si está presente; si falta ya se reportó arriba).
  const secret = String(env.JWT_SECRET ?? '').trim();
  if (secret) {
    if (secret.length < MIN_JWT_SECRET_LENGTH) {
      errors.push(`JWT_SECRET is too short (min ${MIN_JWT_SECRET_LENGTH} characters)`);
    } else if (PLACEHOLDER_JWT_SECRETS.has(secret)) {
      errors.push('JWT_SECRET must not use a default/placeholder value');
    }
  }

  if (errors.length > 0) {
    // Mensaje claro, SIN imprimir valores reales (solo nombres de variables / reglas).
    throw new Error(`Insecure production configuration:\n- ${errors.join('\n- ')}`);
  }

  return { nodeEnv, isProduction };
}

export default validateEnv;
