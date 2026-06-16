import request from 'supertest';
import { describe, it, expect, afterEach } from 'vitest';

import { createApp } from '../app.js';

const originalNodeEnv = process.env.NODE_ENV;
const originalClientUrl = process.env.CLIENT_URL;

afterEach(() => {
  process.env.NODE_ENV = originalNodeEnv;
  if (originalClientUrl === undefined) delete process.env.CLIENT_URL;
  else process.env.CLIENT_URL = originalClientUrl;
});

describe('CORS credentials', () => {
  it('en producción exige CLIENT_URL configurado', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.CLIENT_URL;

    expect(() => createApp()).toThrow(/CLIENT_URL/);
  });

  it('en desarrollo permite localhost:5173 como origen por defecto', async () => {
    process.env.NODE_ENV = 'development';
    delete process.env.CLIENT_URL;

    const res = await request(createApp())
      .get('/api/health')
      .set('Origin', 'http://localhost:5173');

    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });
});
