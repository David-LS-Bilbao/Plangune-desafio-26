import rateLimit from 'express-rate-limit';

const DEFAULT_WINDOW_MS = 15 * 60 * 1000;
const DEFAULT_MAX_ATTEMPTS = 20;

export function createAuthRateLimit(options = {}) {
  return rateLimit({
    windowMs: options.windowMs ?? (Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || DEFAULT_WINDOW_MS),
    limit: options.limit ?? (Number(process.env.AUTH_RATE_LIMIT_MAX) || DEFAULT_MAX_ATTEMPTS),
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Demasiados intentos. Inténtalo de nuevo más tarde.' },
  });
}

export const authRateLimit = createAuthRateLimit();

export default authRateLimit;
