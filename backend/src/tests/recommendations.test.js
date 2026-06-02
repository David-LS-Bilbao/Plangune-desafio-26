import { describe, it, expect } from 'vitest';
import request from 'supertest';

import { createApp } from '../app.js';

const app = createApp();

describe('GET /api/recommendations', () => {
  it('responde 200 con un array de como máximo 3 recomendaciones', async () => {
    const res = await request(app).get('/api/recommendations');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeLessThanOrEqual(3);
  });

  it('cada recomendación tiene shape mínimo { activity, score:número, reasons:array }', async () => {
    const res = await request(app).get('/api/recommendations');

    expect(res.body.length).toBeGreaterThan(0);
    for (const item of res.body) {
      expect(item).toHaveProperty('activity');
      expect(typeof item.score).toBe('number');
      expect(Array.isArray(item.reasons)).toBe(true);
    }
  });

  it('no incluye actividades con status "pending"', async () => {
    const res = await request(app).get('/api/recommendations');

    expect(res.body.every((item) => item.activity.status === 'approved')).toBe(true);
    expect(res.body.some((item) => item.activity.id === 'act-006')).toBe(false);
  });

  it('ordena las recomendaciones de mayor a menor score', async () => {
    const res = await request(app).get('/api/recommendations');

    const scores = res.body.map((item) => item.score);
    const ordenadas = [...scores].sort((a, b) => b - a);
    expect(scores).toEqual(ordenadas);
  });

  it('acepta query de contexto sin romper y devuelve resultados coherentes', async () => {
    const res = await request(app).get(
      '/api/recommendations?childrenAges=2&strollerFriendly=true&rainSuitable=true&budget=40&municipality=Bilbao',
    );

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeLessThanOrEqual(3);
    for (const item of res.body) {
      expect(item).toHaveProperty('activity');
      expect(typeof item.score).toBe('number');
      expect(Array.isArray(item.reasons)).toBe(true);
    }
  });
});
