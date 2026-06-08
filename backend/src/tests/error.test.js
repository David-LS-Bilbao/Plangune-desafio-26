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

  // --- Errores Prisma/DB simulados (hardening) ---

  // Init/conexión/auth de Prisma (DB caída) → debe enmascararse como 503.
  app.get('/test/prisma-init', (req, res, next) => {
    const err = new Error(
      'Authentication failed against database server, the provided database credentials for `desafio26` are not valid.',
    );
    err.name = 'PrismaClientInitializationError';
    err.clientVersion = '6.19.3';
    next(err);
  });

  // KnownRequestError con código de conexión P1001 (no se alcanza la DB) → 503.
  app.get('/test/prisma-p1001', (req, res, next) => {
    const err = new Error("Can't reach database server at `localhost:5434`");
    err.name = 'PrismaClientKnownRequestError';
    err.code = 'P1001';
    err.clientVersion = '6.19.3';
    next(err);
  });

  // Otro error de Prisma (no de conexión, p. ej. P2002) → 500 enmascarado, sin filtrar.
  app.get('/test/prisma-other', (req, res, next) => {
    const err = new Error('Unique constraint failed on the fields: (`email`)');
    err.name = 'PrismaClientKnownRequestError';
    err.code = 'P2002';
    err.clientVersion = '6.19.3';
    next(err);
  });

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

describe('errorHandler · hardening Prisma/DB', () => {
  it('init/conexión Prisma (DB caída) → 503 genérico sin filtrar internos', async () => {
    const res = await request(createErrorTestApp()).get('/test/prisma-init');
    expect(res.status).toBe(503);
    expect(res.body).toEqual({ error: 'Service temporarily unavailable' });
    // No debe filtrar credenciales/usuario de DB ni el detalle del error.
    expect(JSON.stringify(res.body)).not.toMatch(/desafio26|credentials|Authentication/i);
  });

  it('KnownRequestError P1001 (no alcanza la DB) → 503 genérico', async () => {
    const res = await request(createErrorTestApp()).get('/test/prisma-p1001');
    expect(res.status).toBe(503);
    expect(res.body).toEqual({ error: 'Service temporarily unavailable' });
    expect(JSON.stringify(res.body)).not.toMatch(/5434|localhost/i);
  });

  it('otro error de Prisma (P2002) → 500 enmascarado, sin filtrar', async () => {
    const res = await request(createErrorTestApp()).get('/test/prisma-other');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Internal Server Error' });
    expect(JSON.stringify(res.body)).not.toMatch(/Unique constraint|email/i);
  });
});
