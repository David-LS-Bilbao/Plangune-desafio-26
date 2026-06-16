import rateLimit from 'express-rate-limit';

/**
 * Rate limiting de la API en dos niveles:
 *  - Global para todo `/api`  → protección básica anti-abuso/burst.
 *  - Estricto para el asistente → el plan familiar puede tocar LLM/API externa (coste/latencia).
 *
 * En entorno `test` se OMITE (las suites lanzan muchas peticiones a la misma ruta desde la
 * misma IP); permanece ACTIVO en development y production. Todo configurable por env.
 * Los mensajes son genéricos: nunca exponen detalles internos.
 *
 * Nota: detrás de Nginx Proxy Manager hace falta `TRUST_PROXY=1` (ver app.js) para que el
 * conteo use la IP real del cliente y no la del proxy.
 */

const ONE_MINUTE_MS = 60 * 1000;
const GLOBAL_DEFAULT_MAX = 120;
const ASSISTANT_DEFAULT_MAX = 10;

/** Omitir rate limit en tests (no en dev/prod). */
const skipInTest = () => process.env.NODE_ENV === 'test';

/** Limitador global para `/api`. windowMs/limit configurables por env. */
export function createApiRateLimit(options = {}) {
  return rateLimit({
    windowMs: options.windowMs ?? (Number(process.env.API_RATE_LIMIT_WINDOW_MS) || ONE_MINUTE_MS),
    limit: options.limit ?? (Number(process.env.API_RATE_LIMIT_MAX) || GLOBAL_DEFAULT_MAX),
    standardHeaders: true,
    legacyHeaders: false,
    skip: options.skip ?? skipInTest,
    message: { error: 'Demasiadas peticiones. Inténtalo de nuevo en unos segundos.' },
  });
}

/** Limitador estricto para el asistente (más bajo por coste de LLM/API externa). */
export function createAssistantRateLimit(options = {}) {
  return rateLimit({
    windowMs:
      options.windowMs ?? (Number(process.env.ASSISTANT_RATE_LIMIT_WINDOW_MS) || ONE_MINUTE_MS),
    limit: options.limit ?? (Number(process.env.ASSISTANT_RATE_LIMIT_MAX) || ASSISTANT_DEFAULT_MAX),
    standardHeaders: true,
    legacyHeaders: false,
    skip: options.skip ?? skipInTest,
    message: {
      error: 'Demasiadas peticiones al asistente. Inténtalo de nuevo en unos segundos.',
    },
  });
}

export const apiRateLimit = createApiRateLimit();
export const assistantRateLimit = createAssistantRateLimit();

export default { apiRateLimit, assistantRateLimit, createApiRateLimit, createAssistantRateLimit };
