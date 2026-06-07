import { describe, it, expect } from 'vitest';
import request from 'supertest';

import { createApp } from '../app.js';

describe('GET /api/health', () => {
  it('responde 200 con status ok y service DESAFIO-26 API', async () => {
    const app = createApp();

    // Supertest usa la app Express sin arrancar server.js.
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: 'ok',
      service: 'DESAFIO-26 API',
    });
  });
});
