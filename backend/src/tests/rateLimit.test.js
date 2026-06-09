/**
 * Tests de los limitadores de rate (middlewares/rateLimit.middleware.js).
 *
 * Se prueban las FACTORIES con `skip: () => false` para ejercer el límite aunque
 * NODE_ENV==='test' (donde normalmente se omiten). Mensajes seguros (sin internals).
 */
import express from 'express';
import request from 'supertest';
import { describe, it, expect } from 'vitest';

import {
  createApiRateLimit,
  createAssistantRateLimit,
} from '../middlewares/rateLimit.middleware.js';

function appWith(limiter) {
  const app = express();
  app.get('/x', limiter, (_req, res) => res.status(200).json({ ok: true }));
  return app;
}

describe('rateLimit middlewares', () => {
  it('createApiRateLimit: 429 al superar el límite, con mensaje genérico seguro', async () => {
    const app = appWith(createApiRateLimit({ limit: 2, windowMs: 60_000, skip: () => false }));

    expect((await request(app).get('/x')).status).toBe(200);
    expect((await request(app).get('/x')).status).toBe(200);

    const limited = await request(app).get('/x');
    expect(limited.status).toBe(429);
    expect(limited.body).toHaveProperty('error');
    expect(limited.body.error).not.toMatch(/stack|prisma|secret|api[_-]?key/i);
  });

  it('createAssistantRateLimit: 429 con el mensaje específico del asistente', async () => {
    const app = appWith(createAssistantRateLimit({ limit: 1, windowMs: 60_000, skip: () => false }));

    expect((await request(app).get('/x')).status).toBe(200);

    const limited = await request(app).get('/x');
    expect(limited.status).toBe(429);
    expect(limited.body.error).toMatch(/asistente/i);
  });

  it('con skip activo no limita (comportamiento en tests)', async () => {
    const app = appWith(createApiRateLimit({ limit: 1, windowMs: 60_000, skip: () => true }));

    expect((await request(app).get('/x')).status).toBe(200);
    expect((await request(app).get('/x')).status).toBe(200);
    expect((await request(app).get('/x')).status).toBe(200);
  });
});
