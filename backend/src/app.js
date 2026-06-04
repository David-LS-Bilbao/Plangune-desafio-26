import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import router from './routes/index.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';

/**
 * Construye la aplicación Express (sin abrir puerto).
 * Se exporta como factory para poder testear con supertest sin levantar el server.
 */
export function createApp() {
  const app = express();

  // Seguridad y middlewares base
  app.use(helmet());
  app.use(cors({ origin: process.env.CLIENT_URL || true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Logging (silenciado en tests para no ensuciar la salida)
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // Rutas de la API
  app.use('/api', router);

  // 404 + manejador global de errores
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export default createApp;
