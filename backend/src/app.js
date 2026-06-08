import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import router from './routes/index.js';
import { apiRateLimit } from './middlewares/rateLimit.middleware.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';

const DEFAULT_DEV_CLIENT_URL = 'http://localhost:5173';

function getAllowedOrigins() {
  const configured = (process.env.CLIENT_URL || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (configured.length > 0) return configured;

  if (process.env.NODE_ENV === 'production') {
    throw new Error('CLIENT_URL debe estar configurado en producción');
  }

  return [DEFAULT_DEV_CLIENT_URL];
}

/**
 * Construye la aplicación Express (sin abrir puerto).
 * Se exporta como factory para poder testear con supertest sin levantar el server.
 */
export function createApp() {
  const app = express();

  // Detrás de un proxy inverso (Nginx Proxy Manager): confiar 1 salto para que req.ip y
  // el rate-limit usen la IP real del cliente y no la del proxy. Controlado por env;
  // NO activar en local/tests (express-rate-limit lo rechaza con trust proxy permisivo).
  if (process.env.TRUST_PROXY === '1') {
    app.set('trust proxy', 1);
  }

  const allowedOrigins = getAllowedOrigins();

  // Seguridad y middlewares base
  app.use(helmet());
  // `credentials: true` permite que el navegador envíe/reciba la cookie httpOnly de sesión.
  // Se aceptan solo orígenes explícitos: CLIENT_URL (coma-separado) o localhost en dev/test.
  app.use(cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Origen CORS no permitido'));
    },
    credentials: true,
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Logging (silenciado en tests para no ensuciar la salida)
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // Rate limit global de la API (anti-abuso/burst). Omitido en tests; activo en dev/prod.
  app.use('/api', apiRateLimit);

  // Rutas de la API
  app.use('/api', router);

  // 404 + manejador global de errores
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export default createApp;
