import express from 'express';
import request from 'supertest';
import { describe, it, expect } from 'vitest';

import { createAuthRateLimit } from '../middlewares/authRateLimit.middleware.js';

describe('authRateLimit middleware', () => {
  it('devuelve 429 al superar el límite de intentos', async () => {
    const app = express();
    app.post('/login', createAuthRateLimit({ limit: 2, windowMs: 60_000 }), (_req, res) => {
      res.status(200).json({ ok: true });
    });

    expect((await request(app).post('/login')).status).toBe(200);
    expect((await request(app).post('/login')).status).toBe(200);

    const limited = await request(app).post('/login');
    expect(limited.status).toBe(429);
    expect(limited.body).toHaveProperty('error');
  });
});
