import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';

import { createApp } from '../app.js';
import { notFoundHandler, errorHandler } from '../middlewares/error.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// App mínima con rutas solo-test que fuerzan cada escenario de error.
// No usa createApp() para aislar únicamente los middlewares bajo prueba.
function createErrorTestApp() {
  const app = express();
  app.use(express.json());

  // Error genérico sin status → debe resolverse como 500
  app.get('/test/error-500', (req, res, next) => {
    next(new Error('fallo interno'));
  });

  // Error con status 400 → mensaje controlado expuesto al cliente
  app.get('/test/error-400', (req, res, next) => {
    const err = new Error('dato inválido');
    err.status = 400;
    next(err);
  });

  // asyncHandler envolviendo una función async que lanza → debe capturarse como 500
  app.get(
    '/test/async-error',
    asyncHandler(async () => {
      throw new Error('error async');
    }),
  );

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

describe('notFoundHandler', () => {
  it('ruta no definida en /api → 404 con JSON uniforme', async () => {
    const res = await request(createApp()).get('/api/ruta-inexistente');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Not Found' });
  });
});

describe('errorHandler', () => {
  it('error sin status → 500 con campo error en JSON', async () => {
    const res = await request(createErrorTestApp()).get('/test/error-500');
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
    expect(typeof res.body.error).toBe('string');
    expect(res.body.error.length).toBeGreaterThan(0);
  });

  it('error con status 400 → 400 con mensaje controlado', async () => {
    const res = await request(createErrorTestApp()).get('/test/error-400');
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'dato inválido' });
  });
});

describe('asyncHandler', () => {
  it('captura el rechazo de una Promise y lo pasa al errorHandler → 500', async () => {
    const res = await request(createErrorTestApp()).get('/test/async-error');
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
    expect(typeof res.body.error).toBe('string');
  });
});
